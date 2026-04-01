// ---------------------------------------------------------------------------
// Provider registry – single entry-point for all BYOK model providers
// ---------------------------------------------------------------------------
export type {
  Message,
  CompletionRequest,
  CompletionResponse,
  ModelInfo,
  ModelProvider,
} from './types';
export { USD_TO_GBP } from './types';

import type { ModelProvider } from './types';
import { anthropicProvider } from './anthropic';
import { openaiProvider } from './openai';
import { googleProvider } from './google';
import { mistralProvider } from './mistral';

const providers: Record<string, ModelProvider> = {
  [anthropicProvider.id]: anthropicProvider,
  [openaiProvider.id]: openaiProvider,
  [googleProvider.id]: googleProvider,
  [mistralProvider.id]: mistralProvider,
};

/** Look up a single provider by its id (e.g. "anthropic", "openai") */
export function getProvider(id: string): ModelProvider | undefined {
  return providers[id];
}

/** Return every registered provider */
export function getAllProviders(): ModelProvider[] {
  return Object.values(providers);
}
