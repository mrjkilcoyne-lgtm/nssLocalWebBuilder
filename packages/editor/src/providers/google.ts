// ---------------------------------------------------------------------------
// Google Gemini provider adapter
// ---------------------------------------------------------------------------
import type {
  CompletionRequest,
  CompletionResponse,
  Message,
  ModelInfo,
  ModelProvider,
} from './types';
import { USD_TO_GBP } from './types';

const GEMINI_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models';

const models: ModelInfo[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    inputPricePer1M: 0.15,
    outputPricePer1M: 0.6,
    maxContext: 1_000_000,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    inputPricePer1M: 1.25,
    outputPricePer1M: 10,
    maxContext: 1_000_000,
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

/** Map our role names to what Gemini expects */
function mapRole(role: Message['role']): string {
  if (role === 'assistant') return 'model';
  return role; // 'user' stays 'user'; 'system' is handled separately
}

async function complete(
  apiKey: string,
  req: CompletionRequest,
): Promise<CompletionResponse> {
  const url = `${GEMINI_BASE}/${req.model}:generateContent?key=${apiKey}`;

  // System message goes in systemInstruction
  const systemMsg = req.messages.find((m) => m.role === 'system');
  const chatMessages = req.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: mapRole(m.role),
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents: chatMessages,
    generationConfig: {
      maxOutputTokens: req.maxTokens ?? 4096,
      ...(req.temperature !== undefined && { temperature: req.temperature }),
    },
  };
  if (systemMsg) {
    body.systemInstruction = {
      parts: [{ text: systemMsg.content }],
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const inputTokens: number = data.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens: number = data.usageMetadata?.candidatesTokenCount ?? 0;

  return {
    content: data.candidates[0].content.parts[0].text,
    model: req.model,
    inputTokens,
    outputTokens,
    costEstimate: estimateCost(req.model, inputTokens, outputTokens),
  };
}

async function validateKey(apiKey: string): Promise<boolean> {
  try {
    const url = `${GEMINI_BASE}?key=${apiKey}`;
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

export const googleProvider: ModelProvider = {
  name: 'Google Gemini',
  id: 'google',
  models,
  complete,
  estimateCost,
  validateKey,
};
