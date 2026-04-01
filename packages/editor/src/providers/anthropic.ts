// ---------------------------------------------------------------------------
// Anthropic Claude provider adapter
// ---------------------------------------------------------------------------
import type {
  CompletionRequest,
  CompletionResponse,
  Message,
  ModelInfo,
  ModelProvider,
  StreamingCompletionRequest,
} from './types';
import { USD_TO_GBP } from './types';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

const models: ModelInfo[] = [
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    inputPricePer1M: 3,
    outputPricePer1M: 15,
    maxContext: 200_000,
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    inputPricePer1M: 0.8,
    outputPricePer1M: 4,
    maxContext: 200_000,
  },
];

function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const info = models.find((m) => m.id === modelId) ?? models[0];
  const usd =
    (inputTokens / 1_000_000) * info.inputPricePer1M +
    (outputTokens / 1_000_000) * info.outputPricePer1M;
  return usd * USD_TO_GBP;
}

function headers(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };
}

async function complete(
  apiKey: string,
  req: CompletionRequest,
): Promise<CompletionResponse> {
  // Anthropic expects system as a top-level field, not inside messages
  const systemMsg = req.messages.find((m) => m.role === 'system');
  const userMessages = req.messages
    .filter((m): m is Message & { role: 'user' | 'assistant' } => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));

  const body: Record<string, unknown> = {
    model: req.model,
    max_tokens: req.maxTokens ?? 4096,
    messages: userMessages,
  };
  if (systemMsg) {
    body.system = systemMsg.content;
  }
  if (req.temperature !== undefined) {
    body.temperature = req.temperature;
  }

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const inputTokens: number = data.usage.input_tokens;
  const outputTokens: number = data.usage.output_tokens;

  return {
    content: data.content[0].text,
    model: data.model ?? req.model,
    inputTokens,
    outputTokens,
    costEstimate: estimateCost(req.model, inputTokens, outputTokens),
  };
}

async function stream(
  apiKey: string,
  req: StreamingCompletionRequest,
): Promise<CompletionResponse> {
  const systemMsg = req.messages.find((m) => m.role === 'system');
  const userMessages = req.messages
    .filter((m): m is Message & { role: 'user' | 'assistant' } => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));

  const body: Record<string, unknown> = {
    model: req.model,
    max_tokens: req.maxTokens ?? 4096,
    messages: userMessages,
    stream: true,
  };
  if (systemMsg) {
    body.system = systemMsg.content;
  }
  if (req.temperature !== undefined) {
    body.temperature = req.temperature;
  }

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let inputTokens = 0;
  let outputTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json || json === '[DONE]') continue;

      try {
        const event = JSON.parse(json);
        if (event.type === 'content_block_delta' && event.delta?.text) {
          content += event.delta.text;
          req.onToken(event.delta.text);
        } else if (event.type === 'message_start' && event.message?.usage) {
          inputTokens = event.message.usage.input_tokens ?? 0;
        } else if (event.type === 'message_delta' && event.usage) {
          outputTokens = event.usage.output_tokens ?? 0;
        }
      } catch {
        // skip malformed JSON
      }
    }
  }

  const response: CompletionResponse = {
    content,
    model: req.model,
    inputTokens,
    outputTokens,
    costEstimate: estimateCost(req.model, inputTokens, outputTokens),
  };
  req.onComplete?.(response);
  return response;
}

async function validateKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const anthropicProvider: ModelProvider = {
  name: 'Anthropic',
  id: 'anthropic',
  models,
  complete,
  estimateCost,
  validateKey,
  stream,
};
