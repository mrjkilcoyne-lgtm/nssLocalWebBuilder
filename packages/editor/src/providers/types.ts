// ---------------------------------------------------------------------------
// BYOK Model Provider Adapters – shared types
// ---------------------------------------------------------------------------

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  /** Estimated cost in GBP */
  costEstimate: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  /** Price per 1 M input tokens (USD) */
  inputPricePer1M: number;
  /** Price per 1 M output tokens (USD) */
  outputPricePer1M: number;
  maxContext: number;
}

export interface ModelProvider {
  /** Human-readable display name */
  name: string;
  /** Unique provider identifier */
  id: string;
  /** Available models with pricing metadata */
  models: ModelInfo[];
  /** Send a chat-completion request and return structured response */
  complete(apiKey: string, req: CompletionRequest): Promise<CompletionResponse>;
  /** Estimate cost in GBP for a given token count */
  estimateCost(model: string, inputTokens: number, outputTokens: number): number;
  /** Validate that an API key is functional */
  validateKey(apiKey: string): Promise<boolean>;
}

/** USD → GBP conversion factor */
export const USD_TO_GBP = 0.79;
