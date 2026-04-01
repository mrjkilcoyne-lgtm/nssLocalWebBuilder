import type { ConversationMessage, ConversationStage, StageResponse } from '../types.js';
import { buildPrompt, type StageName } from './prompts.js';

/**
 * Determine the current conversation stage from the message history.
 */
function determineStage(history: ConversationMessage[]): ConversationStage {
  const allText = history.map((m) => m.content).join('\n');

  // Check for stage completion markers in assistant messages
  const assistantMessages = history
    .filter((m) => m.role === 'assistant')
    .map((m) => m.content)
    .join('\n');

  if (assistantMessages.includes('[MODALITIES_COMPLETE:')) {
    return 'recommendation';
  }
  if (assistantMessages.includes('[GATHERING_COMPLETE]')) {
    return 'modalities';
  }
  if (assistantMessages.includes('[INTENT_CLASSIFIED:')) {
    return 'gathering';
  }

  // Also check if we have enough context even without explicit markers
  const messageCount = history.filter((m) => m.role === 'user').length;
  if (messageCount === 0) {
    return 'intent';
  }

  // Default: still in intent stage if nothing else matches
  return 'intent';
}

/**
 * Map conversation stage to prompt stage name.
 */
function stageToPromptName(stage: ConversationStage): StageName {
  switch (stage) {
    case 'intent':
      return 'intent';
    case 'gathering':
      return 'gathering';
    case 'modalities':
      return 'modalities';
    case 'recommendation':
      return 'recommendation';
  }
}

/**
 * Process a user message and return an AI response.
 *
 * This builds the prompt that would be sent to an LLM API.
 * The actual LLM call is left as a placeholder — the function returns
 * the prompt that would be sent along with a placeholder response.
 */
export function processMessage(
  _conversationId: string,
  userMessage: string,
  conversationHistory: ConversationMessage[],
): StageResponse {
  const stage = determineStage(conversationHistory);
  const promptName = stageToPromptName(stage);

  const prompt = buildPrompt(
    promptName,
    conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    userMessage,
  );

  // Placeholder: In production, this prompt would be sent to an LLM API
  // (OpenAI, Anthropic, etc.) and the response would be returned.
  const placeholderResponse = getPlaceholderResponse(stage, userMessage);

  return {
    stage,
    message: placeholderResponse,
    promptForLLM: JSON.stringify(prompt, null, 2),
  };
}

/**
 * Generate a placeholder response for each stage.
 * Replace this with actual LLM API calls in production.
 */
function getPlaceholderResponse(stage: ConversationStage, userMessage: string): string {
  switch (stage) {
    case 'intent':
      return `Thanks for sharing! It sounds like you want to build something interesting. To give you the best recommendation, could you tell me more about what you're creating? For example, is it a website, a web app, a mobile app, or something else? (Note: This is a placeholder response. In production, an LLM would provide a contextual reply based on: "${userMessage.slice(0, 50)}...")`;

    case 'gathering':
      return `Great, I'm getting a clearer picture! Now I need to understand your practical constraints. What's your approximate monthly budget for hosting and services? (Note: Placeholder response — LLM would continue the conversation naturally.)`;

    case 'modalities':
      return `Now let's figure out the specific capabilities you'll need. Do you need any of the following: user authentication, file storage, a database, email notifications, or payment processing? (Note: Placeholder response — LLM would tailor questions to your specific project.)`;

    case 'recommendation':
      return `Based on our conversation, I'm putting together your personalized stack recommendation. This will include specific products, pricing, and a getting-started guide tailored to your experience level. (Note: Placeholder — in production, the LLM would generate a full recommendation and the stack builder would query the product catalog.)`;
  }
}
