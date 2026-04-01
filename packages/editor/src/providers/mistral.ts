// ---------------------------------------------------------------------------
// Mistral provider adapter
// ---------------------------------------------------------------------------
import type {
  CompletionRequest,
  CompletionResponse,
  ModelInfo,
  ModelProvider,
  StreamingCompletionRequest,
} from './types';
import { USD_TO_GBP } from './types';

const MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions';

const models: ModelInfo[] = [
  {
    id: 'mistral-small-latest',
    name: 'Mistral Small',
    inputPricePer1M: 0.1,
    outputPricePer1M: 0.3,
    maxContext: 32_000,
  },
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    inputPricePer1M: 2,
    outputPricePer1M: 6,
    maxContext: 128_000,
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
    Authorization: `Bearer ${apiKey}`,
  };
}

async function complete(
  apiKey: string,
  req: CompletionRequest,
): Promise<CompletionResponse> {
  const messages = req.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const body: Record<string, unknown> = {
    model: req.model,
    messages,
    max_tokens: req.maxTokens ?? 4096,
  };
  if (req.temperature !== undefined) {
    body.temperature = req.temperature;
  }

  const res = await fetch(MISTRAL_API, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const inputTokens: number = data.usage.prompt_tokens;
  const outputTokens: number = data.usage.completion_tokens;

  return {
    content: data.choices[0].message.content,
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
  const messages = req.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const body: Record<string, unknown> = {
    model: req.model,
    messages,
    max_tokens: req.maxTokens ?? 4096,
    stream: true,
  };
  if (req.temperature !== undefined) {
    body.temperature = req.temperature;
  }

  const res = await fetch(MISTRAL_API, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral API error ${res.status}: ${err}`);
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
        const delta = event.choices?.[0]?.delta?.content;
        if (delta) {
          content += delta;
          req.onToken(delta);
        }
        if (event.usage) {
          inputTokens = event.usage.prompt_tokens ?? 0;
          outputTokens = event.usage.completion_tokens ?? 0;
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
    const res = await fetch('https://api.mistral.ai/v1/models', {
      headers: headers(apiKey),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const mistralProvider: ModelProvider = {
  name: 'Mistral',
  id: 'mistral',
  models,
  complete,
  estimateCost,
  validateKey,
  stream,
};
