// ---------------------------------------------------------------------------
// OpenAI provider adapter
// ---------------------------------------------------------------------------
import type {
  CompletionRequest,
  CompletionResponse,
  ModelInfo,
  ModelProvider,
} from './types';
import { USD_TO_GBP } from './types';

const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

const models: ModelInfo[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    inputPricePer1M: 2.5,
    outputPricePer1M: 10,
    maxContext: 128_000,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    inputPricePer1M: 0.15,
    outputPricePer1M: 0.6,
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

  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
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

async function validateKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: headers(apiKey),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const openaiProvider: ModelProvider = {
  name: 'OpenAI',
  id: 'openai',
  models,
  complete,
  estimateCost,
  validateKey,
};
