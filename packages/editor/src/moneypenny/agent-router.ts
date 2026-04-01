// ---------------------------------------------------------------------------
// Agent Router — detect intent, route to provider, track cost
// ---------------------------------------------------------------------------
import { useAiStore } from '../store/aiStore'
import { useChatStore, type AgentType, type ChatMessage } from '../store/chatStore'
import { getProvider, type Message } from '../providers'
import { MONEYPENNY_SYSTEM_PROMPT } from './system-prompt'
import { buildMemoryContext } from './memory'

// ---------------------------------------------------------------------------
// Intent detection — simple keyword classifier
// ---------------------------------------------------------------------------
const INTENT_PATTERNS: { type: AgentType; patterns: RegExp[] }[] = [
  {
    type: 'content',
    patterns: [
      /\b(write|copy|text|heading|paragraph|blog|article|page content|rewrite)\b/i,
    ],
  },
  {
    type: 'design',
    patterns: [
      /\b(design|layout|colour|color|font|style|spacing|visual|theme|brand)\b/i,
    ],
  },
  {
    type: 'code',
    patterns: [
      /\b(code|html|css|javascript|component|script|function|bug|fix|implement)\b/i,
    ],
  },
  {
    type: 'seo',
    patterns: [
      /\b(seo|search engine|meta|title tag|description|keywords|ranking|sitemap)\b/i,
    ],
  },
]

export function detectAgentType(message: string): AgentType {
  for (const { type, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(message))) return type
  }
  return 'general'
}

// ---------------------------------------------------------------------------
// Build conversation payload (system + last N messages)
// ---------------------------------------------------------------------------
const MAX_HISTORY = 10

async function buildMessages(messages: ChatMessage[]): Promise<Message[]> {
  const history = messages.slice(-MAX_HISTORY)
  const memoryContext = await buildMemoryContext()
  const systemContent = memoryContext
    ? MONEYPENNY_SYSTEM_PROMPT + memoryContext
    : MONEYPENNY_SYSTEM_PROMPT

  const payload: Message[] = [
    { role: 'system', content: systemContent },
  ]
  for (const m of history) {
    payload.push({ role: m.role, content: m.content })
  }
  return payload
}

// ---------------------------------------------------------------------------
// Main router function — called when user sends a message
// ---------------------------------------------------------------------------
export async function routeMessage(userMessage: string): Promise<string> {
  const ai = useAiStore.getState()
  const chat = useChatStore.getState()

  // Check for configured provider
  const configured = ai.getConfiguredProvider()
  if (!configured) {
    return (
      'I don\'t have access to an AI model yet. ' +
      'Open Settings (click the cog or press Ctrl+,) to add an API key and select a default model.'
    )
  }

  const { providerId, model } = configured
  const provider = getProvider(providerId)
  if (!provider) {
    return 'The configured provider could not be found. Please check Settings.'
  }

  const apiKeyEntry = ai.apiKeys.find(
    (k) => k.providerId === providerId && k.validated,
  )
  if (!apiKeyEntry) {
    return 'No validated API key found for the selected provider. Please check Settings.'
  }

  // Detect agent type
  const agentType = detectAgentType(userMessage)
  const agentId = Math.random().toString(36).substring(2, 10)

  // Register active agent
  chat.addActiveAgent({
    id: agentId,
    type: agentType,
    status: 'working',
    model,
    costSoFar: 0,
  })

  try {
    // Build messages including the new user message
    const allMessages: ChatMessage[] = [
      ...chat.messages,
      {
        id: 'pending',
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      },
    ]

    const response = await provider.complete(apiKeyEntry.apiKey, {
      model,
      messages: await buildMessages(allMessages),
    })

    // Track cost
    const costRecord = {
      timestamp: Date.now(),
      providerId,
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      costGBP: response.costEstimate,
      task: agentType,
    }
    ai.addCostRecord(costRecord)

    // Update agent status
    chat.updateAgent(agentId, {
      status: 'done',
      costSoFar: response.costEstimate,
    })

    // Remove agent after a brief display period
    setTimeout(() => {
      useChatStore.getState().removeAgent(agentId)
    }, 3000)

    // Add assistant message
    chat.addMessage({
      id: Math.random().toString(36).substring(2, 10),
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
      costGBP: response.costEstimate,
      model: response.model,
      agentType,
    })

    return response.content
  } catch (err) {
    chat.updateAgent(agentId, { status: 'error' })
    setTimeout(() => {
      useChatStore.getState().removeAgent(agentId)
    }, 5000)

    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.'
    return `I encountered an error: ${message}`
  }
}
