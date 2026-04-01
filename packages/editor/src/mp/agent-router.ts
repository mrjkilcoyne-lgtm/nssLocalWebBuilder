// ---------------------------------------------------------------------------
// Agent Router — detect intent, route to provider, track cost
// ---------------------------------------------------------------------------
import { useAiStore } from '../store/aiStore'
import { useChatStore, type AgentType, type ChatMessage } from '../store/chatStore'
import { getProvider, type Message } from '../providers'
import { MP_SYSTEM_PROMPT } from './system-prompt'
import { buildMemoryContext } from './memory'

// ---------------------------------------------------------------------------
// Agent skill definitions
// ---------------------------------------------------------------------------
export interface AgentSkill {
  id: AgentType
  name: string
  capabilities: string[]
  triggers: { regex: RegExp[]; keywords: string[] }
  dependencies: AgentType[]
  costTier: 'cheap' | 'medium' | 'expensive'
  systemPromptExtension: string
}

const AGENT_SKILLS: AgentSkill[] = [
  {
    id: 'content',
    name: 'Content',
    capabilities: ['copywriting', 'blog posts', 'page content', 'rewrites'],
    triggers: {
      regex: [/\b(write|copy|text|heading|paragraph|blog|article|page content|rewrite|draft)\b/i],
      keywords: ['write', 'copy', 'text', 'blog', 'article', 'rewrite', 'draft', 'content'],
    },
    dependencies: [],
    costTier: 'cheap',
    systemPromptExtension: 'You are the Content Agent. Focus on clear, engaging copy. Match the brand voice if one is remembered.',
  },
  {
    id: 'design',
    name: 'Design',
    capabilities: ['layout', 'colours', 'typography', 'branding', 'visual design'],
    triggers: {
      regex: [/\b(design|layout|colour|color|font|style|spacing|visual|theme|brand|aesthetic)\b/i],
      keywords: ['design', 'layout', 'colour', 'font', 'style', 'theme', 'brand', 'visual'],
    },
    dependencies: [],
    costTier: 'medium',
    systemPromptExtension: 'You are the Design Agent. Think in terms of visual hierarchy, whitespace, and brand consistency.',
  },
  {
    id: 'code',
    name: 'Code',
    capabilities: ['HTML', 'CSS', 'JavaScript', 'components', 'debugging'],
    triggers: {
      regex: [/\b(code|html|css|javascript|component|script|function|bug|fix|implement|api)\b/i],
      keywords: ['code', 'html', 'css', 'javascript', 'component', 'bug', 'fix', 'implement'],
    },
    dependencies: [],
    costTier: 'medium',
    systemPromptExtension: 'You are the Code Agent. Write clean, semantic HTML/CSS/JS. Prefer modern standards. No frameworks unless requested.',
  },
  {
    id: 'seo',
    name: 'SEO',
    capabilities: ['meta tags', 'keywords', 'structured data', 'sitemap', 'ranking analysis'],
    triggers: {
      regex: [/\b(seo|search engine|meta|title tag|description|keywords|ranking|sitemap|schema)\b/i],
      keywords: ['seo', 'search', 'meta', 'keywords', 'ranking', 'sitemap'],
    },
    dependencies: [],
    costTier: 'cheap',
    systemPromptExtension: 'You are the SEO Agent. Optimise for both traditional search engines and LLM citation systems.',
  },
  {
    id: 'deploy',
    name: 'Deploy',
    capabilities: ['publishing', 'hosting', 'domains', 'SSL'],
    triggers: {
      regex: [/\b(deploy|publish|launch|hosting|domain|live|ssl|upload)\b/i],
      keywords: ['deploy', 'publish', 'launch', 'hosting', 'domain', 'live'],
    },
    dependencies: [],
    costTier: 'cheap',
    systemPromptExtension: 'You are the Deploy Agent. Guide deployment to the configured hosting provider.',
  },
  {
    id: 'commerce',
    name: 'Commerce',
    capabilities: ['products', 'payments', 'pricing', 'inventory', 'subscriptions'],
    triggers: {
      regex: [/\b(shop|product|payment|price|checkout|cart|commerce|stripe|buy|sell|subscription)\b/i],
      keywords: ['shop', 'product', 'payment', 'price', 'checkout', 'commerce', 'stripe'],
    },
    dependencies: [],
    costTier: 'medium',
    systemPromptExtension: 'You are the Commerce Agent. Handle product catalogues, payment integrations, and checkout flows.',
  },
  {
    id: 'research',
    name: 'Research',
    capabilities: ['competitor analysis', 'market research', 'tool recommendations'],
    triggers: {
      regex: [/\b(research|compare|recommend|suggest|analyse|analyze|review|competitor|alternative)\b/i],
      keywords: ['research', 'compare', 'recommend', 'suggest', 'analyse', 'review'],
    },
    dependencies: [],
    costTier: 'cheap',
    systemPromptExtension: 'You are the Research Agent. Provide well-reasoned recommendations based on available knowledge.',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    capabilities: ['traffic analysis', 'performance', 'cost tracking', 'reporting'],
    triggers: {
      regex: [/\b(analytics|traffic|performance|metrics|report|stats|tracking|conversion)\b/i],
      keywords: ['analytics', 'traffic', 'performance', 'metrics', 'report', 'stats'],
    },
    dependencies: [],
    costTier: 'cheap',
    systemPromptExtension: 'You are the Analytics Agent. Interpret data clearly and suggest actionable improvements.',
  },
]

// ---------------------------------------------------------------------------
// Intent detection — regex fast path + keyword scoring
// ---------------------------------------------------------------------------
export function detectAgentType(message: string): AgentType {
  for (const skill of AGENT_SKILLS) {
    if (skill.triggers.regex.some(p => p.test(message))) return skill.id
  }

  const msgWords = new Set(message.toLowerCase().split(/\W+/))
  let bestScore = 0
  let bestAgent: AgentType = 'general'

  for (const skill of AGENT_SKILLS) {
    const overlap = skill.triggers.keywords.filter(k => msgWords.has(k)).length
    if (overlap > bestScore) {
      bestScore = overlap
      bestAgent = skill.id
    }
  }

  return bestScore > 0 ? bestAgent : 'general'
}

export function getAgentSkill(type: AgentType): AgentSkill | undefined {
  return AGENT_SKILLS.find(s => s.id === type)
}

// ---------------------------------------------------------------------------
// Build conversation payload
// ---------------------------------------------------------------------------
const MAX_HISTORY = 10

async function buildMessages(
  messages: ChatMessage[],
  agentType: AgentType,
  userMessage: string,
): Promise<Message[]> {
  const history = messages.slice(-MAX_HISTORY)
  const memoryContext = await buildMemoryContext(agentType, userMessage)
  const skill = getAgentSkill(agentType)

  let systemContent = MP_SYSTEM_PROMPT
  if (skill) {
    systemContent += `\n\nActive agent: ${skill.name}\n${skill.systemPromptExtension}`
  }
  if (memoryContext) {
    systemContent += memoryContext
  }

  const payload: Message[] = [
    { role: 'system', content: systemContent },
  ]
  for (const m of history) {
    payload.push({ role: m.role, content: m.content })
  }
  return payload
}

// ---------------------------------------------------------------------------
// Cost estimation
// ---------------------------------------------------------------------------
export function estimateRequestCost(
  providerId: string,
  model: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number,
): number {
  const provider = getProvider(providerId)
  if (!provider) return 0
  return provider.estimateCost(model, estimatedInputTokens, estimatedOutputTokens)
}

// ---------------------------------------------------------------------------
// Retry with exponential backoff
// ---------------------------------------------------------------------------
const RETRY_STATUS_CODES = new Set([429, 500, 503])
const MAX_RETRIES = 3

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | undefined
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const statusMatch = lastError.message.match(/error (\d+):/)
      if (statusMatch) {
        const status = parseInt(statusMatch[1], 10)
        if (!RETRY_STATUS_CODES.has(status)) throw lastError
      }
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
      }
    }
  }
  throw lastError!
}

// ---------------------------------------------------------------------------
// Main router
// ---------------------------------------------------------------------------
export async function routeMessage(userMessage: string): Promise<string> {
  const ai = useAiStore.getState()
  const chat = useChatStore.getState()

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

  const agentType = detectAgentType(userMessage)
  const agentId = Math.random().toString(36).substring(2, 10)

  chat.addActiveAgent({
    id: agentId,
    type: agentType,
    status: 'working',
    model,
    costSoFar: 0,
  })

  try {
    const allMessages: ChatMessage[] = [
      ...chat.messages,
      {
        id: 'pending',
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      },
    ]

    const builtMessages = await buildMessages(allMessages, agentType, userMessage)

    // Try streaming first, fall back to complete
    let response
    if (provider.stream) {
      chat.setStreamingContent('')
      response = await withRetry(() =>
        provider.stream!(apiKeyEntry.apiKey, {
          model,
          messages: builtMessages,
          onToken: (token) => {
            useChatStore.getState().appendStreamingContent(token)
          },
        })
      )
      chat.setStreamingContent('')
    } else {
      response = await withRetry(() =>
        provider.complete(apiKeyEntry.apiKey, {
          model,
          messages: builtMessages,
        })
      )
    }

    ai.addCostRecord({
      timestamp: Date.now(),
      providerId,
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      costGBP: response.costEstimate,
      task: agentType,
    })

    chat.updateAgent(agentId, {
      status: 'done',
      costSoFar: response.costEstimate,
    })

    setTimeout(() => {
      useChatStore.getState().removeAgent(agentId)
    }, 3000)

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
    chat.setStreamingContent('')
    setTimeout(() => {
      useChatStore.getState().removeAgent(agentId)
    }, 5000)

    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.'
    return `I encountered an error: ${message}`
  }
}
