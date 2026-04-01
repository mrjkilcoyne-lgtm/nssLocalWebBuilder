export interface EncryptedData {
  encrypted: string;
  iv: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConversationRecord {
  id: string;
  region: string;
  experience_level: number | null;
  intent: string | null;
  encrypted_messages: string | null;
  iv: string | null;
  stack_recommendation: StackRecommendation | null;
  noob_score: number | null;
  created_at: string;
  expires_at: string;
}

export interface ConversationAnswers {
  selfReportedExperience: number; // 1-10 self-reported
  technicalLanguageComplexity: number; // 1-10 derived from language analysis
  modalityBreadth: number; // 1-10 derived from number/complexity of modalities
}

export type ConversationStage =
  | 'intent'
  | 'gathering'
  | 'modalities'
  | 'recommendation';

export interface StageResponse {
  stage: ConversationStage;
  message: string;
  stackRecommendation?: StackRecommendation;
  promptForLLM?: string;
}

export interface StackItem {
  product_id: string;
  name: string;
  category: string;
  modality: string;
  price_monthly: number;
  review_score: number;
  beginner_friendly: boolean;
  affiliate_link: string;
}

export interface StackRecommendation {
  items: StackItem[];
  total_monthly_cost: number;
  noob_score: number;
  reasoning: string;
}

export interface StackQuery {
  intent: string;
  budget: number;
  region: string;
  modalities: string[];
  experienceLevel: number;
}
