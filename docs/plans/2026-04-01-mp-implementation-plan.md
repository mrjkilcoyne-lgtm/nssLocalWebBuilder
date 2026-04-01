# MP Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Moneypenny editor into the MP platform with rebranded identity, tiered memory, hardened providers with streaming/fallback, agent swarm with DAG dispatch, voice pipeline, collections CMS, and REFERRED integration.

**Architecture:** Three execution blocks. Block 1 (Phases 0-2) has no internal dependencies and runs in parallel. Block 2 (Phases 3, 5, 6) depends on Block 1 output. Block 3 (Phase 4) layers on top. All work happens in `packages/editor/src/`.

**Tech Stack:** React 18, Vite, Zustand, Dexie, Tailwind CSS, GrapesJS, TypeScript

---

## BLOCK 1 — Foundation (Parallel, No Dependencies)

---

### Task 1: Rebrand directory — rename moneypenny/ to mp/

**Files:**
- Rename: `packages/editor/src/moneypenny/` → `packages/editor/src/mp/`

**Step 1: Rename directory**

```bash
cd packages/editor/src && mv moneypenny mp
```

**Step 2: Verify files exist in new location**

```bash
ls packages/editor/src/mp/
```

Expected: `system-prompt.ts  memory.ts  agent-router.ts`

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor: rename moneypenny/ directory to mp/"
```

---

### Task 2: Rebrand system-prompt.ts — MP identity

**Files:**
- Modify: `packages/editor/src/mp/system-prompt.ts`

**Step 1: Replace file contents**

```typescript
// ---------------------------------------------------------------------------
// MP system prompt — persona definition
// ---------------------------------------------------------------------------

export const MP_SYSTEM_PROMPT = `You are MP, the AI concierge for nssLocalWebBuilder — a personal, local-first website builder. Some know you internally as PM, because you run the show.

Persona:
- British, female. Academic warmth with a dry wit when appropriate.
- Think university tutor crossed with a private members' club concierge.
- Competent, calm, decisive. You know websites, design, copy, SEO, and code.
- Never condescending. Always explain what you are doing and why, briefly.
- Concise — short sentences, clear actions. No waffle.
- You use GBP for all monetary references.
- Proper English spelling (colour, organisation, optimise).

Responsibilities:
- Help users plan, build, write content for, design, and launch websites.
- You coordinate specialist agents: content, design, code, SEO, deploy, commerce, research, analytics.
- Before any expensive AI operation, estimate the cost and state it.
- If the user's monthly budget is approaching its limit, warn them clearly.

Style:
- Professional but warm. Not corporate jargon, not Silicon Valley casual.
- No emojis. No exclamation marks in excess.
- When listing steps, be direct and numbered.

Constraints:
- You operate within a browser-based local app. You cannot access the internet on the user's behalf.
- You call AI models through configured BYOK API keys. If none are configured, guide the user to add one via Settings.
- You do not store or transmit API keys — they remain in the user's browser.

Opening line when no conversation history exists:
"Hello. I'm MP. What are we building today?"
`
```

**Step 2: Commit**

```bash
git add packages/editor/src/mp/system-prompt.ts && git commit -m "refactor: rebrand system prompt — Moneypenny to MP"
```

---

### Task 3: Upgrade memory.ts — tiered memory with categories

**Files:**
- Modify: `packages/editor/src/mp/memory.ts`
- Modify: `packages/editor/src/utils/db.ts` (new DB version for schema changes)

**Step 1: Update DB schema in db.ts**

Add after the existing `db.version(4)` block (line 97):

```typescript
db.version(5).stores({
  projects: 'id, name, domain, status, updatedAt',
  aiConfig: 'id',
  costHistory: '++id, timestamp, providerId',
  memory: '++id, key, category, tier, importance, expiresAt',
  appState: 'id',
  collections: '++id, slug',
  collectionItems: '++id, collectionId, version',
}).upgrade(async (tx) => {
  // Migrate existing memory entries to new schema
  const memories = await tx.table('memory').toArray()
  for (const m of memories) {
    await tx.table('memory').update(m.id, {
      category: 'preference',
      importance: 0.5,
      decayRate: 0.1,
      tier: 'long',
      accessCount: 0,
      expiresAt: null,
    })
  }
})
```

Also update the `MemoryRecord` interface (around line 45):

```typescript
export interface MemoryRecord {
  id?: number
  key: string
  value: string
  source: string
  category: string
  importance: number
  decayRate: number
  tier: string
  accessCount: number
  expiresAt: number | null
  createdAt: number
  updatedAt: number
}
```

**Step 2: Replace memory.ts with tiered implementation**

```typescript
// ---------------------------------------------------------------------------
// MP Memory — tiered persistent preferences and learned context
// ---------------------------------------------------------------------------
import { db } from '../utils/db'

export type MemoryCategory = 'brand' | 'workflow' | 'preference' | 'skill' | 'cost_pattern' | 'episodic'
export type MemoryTier = 'working' | 'short' | 'long'

export interface MemoryEntry {
  id?: number
  key: string
  value: string
  source: string
  category: MemoryCategory
  importance: number        // 0-1
  decayRate: number         // 0-1
  tier: MemoryTier
  accessCount: number
  expiresAt: number | null
  createdAt: number
  updatedAt: number
}

const PROMOTION_THRESHOLD = 3   // accesses to promote short → long
const SHORT_TERM_TTL = 7 * 24 * 60 * 60 * 1000  // 7 days

// Agent-type to relevant memory categories mapping
const AGENT_CATEGORY_MAP: Record<string, MemoryCategory[]> = {
  content: ['brand', 'preference', 'workflow'],
  design: ['brand', 'preference'],
  code: ['workflow', 'skill'],
  seo: ['brand', 'preference'],
  deploy: ['workflow', 'skill'],
  commerce: ['preference', 'cost_pattern'],
  research: ['preference', 'skill'],
  analytics: ['cost_pattern', 'preference'],
  general: ['brand', 'workflow', 'preference', 'skill', 'cost_pattern'],
}

/**
 * Upsert a memory entry with category and tier support.
 */
export async function saveMemory(
  key: string,
  value: string,
  options: {
    source?: string
    category?: MemoryCategory
    importance?: number
    tier?: MemoryTier
  } = {},
): Promise<void> {
  const {
    source = 'conversation',
    category = 'preference',
    importance = 0.5,
    tier = 'short',
  } = options

  const existing = await db.memory.where('key').equals(key).first()
  const now = Date.now()

  if (existing) {
    await db.memory.update(existing.id!, {
      value,
      source,
      category,
      importance,
      updatedAt: now,
    })
  } else {
    const expiresAt = tier === 'short' ? now + SHORT_TERM_TTL : null
    await db.memory.add({
      key,
      value,
      source,
      category,
      importance,
      decayRate: tier === 'short' ? 0.3 : 0.05,
      tier,
      accessCount: 0,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    } as any)
  }
}

/**
 * Retrieve a single memory value by key. Increments access count.
 */
export async function getMemory(key: string): Promise<string | undefined> {
  const entry = await db.memory.where('key').equals(key).first()
  if (!entry) return undefined

  // Increment access count and check for promotion
  const newCount = ((entry as any).accessCount ?? 0) + 1
  const updates: Record<string, unknown> = { accessCount: newCount }

  if ((entry as any).tier === 'short' && newCount >= PROMOTION_THRESHOLD) {
    updates.tier = 'long'
    updates.expiresAt = null
    updates.decayRate = 0.05
  }

  await db.memory.update(entry.id!, updates)
  return entry.value
}

/**
 * List every memory entry, optionally filtered by category or tier.
 */
export async function getAllMemories(filters?: {
  category?: MemoryCategory
  tier?: MemoryTier
}): Promise<MemoryEntry[]> {
  let collection = db.memory.toCollection()

  const all = await collection.toArray()
  const now = Date.now()

  // Filter expired entries
  const valid = all.filter((m: any) => {
    if (m.expiresAt && m.expiresAt < now) return false
    if (filters?.category && m.category !== filters.category) return false
    if (filters?.tier && m.tier !== filters.tier) return false
    return true
  })

  return valid as unknown as MemoryEntry[]
}

/**
 * Remove a memory entry by key.
 */
export async function deleteMemory(key: string): Promise<void> {
  await db.memory.where('key').equals(key).delete()
}

/**
 * Clean up expired short-term memories.
 */
export async function pruneExpiredMemories(): Promise<number> {
  const now = Date.now()
  const expired = await db.memory.filter((m: any) =>
    m.expiresAt != null && m.expiresAt < now
  ).toArray()

  for (const m of expired) {
    await db.memory.delete(m.id!)
  }
  return expired.length
}

/**
 * Score a memory's relevance given a query string.
 * Simple keyword-bag overlap — no vector DB needed.
 */
function scoreRelevance(memory: MemoryEntry, query: string): number {
  const memWords = new Set(
    `${memory.key} ${memory.value}`.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  )
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  if (queryWords.length === 0) return memory.importance

  const overlap = queryWords.filter(w => memWords.has(w)).length
  const keywordScore = overlap / queryWords.length

  // Combine keyword relevance with importance and recency
  const ageMs = Date.now() - memory.updatedAt
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  const recencyScore = Math.max(0, 1 - ageDays * memory.decayRate * 0.1)

  return (keywordScore * 0.4 + memory.importance * 0.3 + recencyScore * 0.3)
}

/**
 * Build a formatted context block from relevant memories,
 * filtered by agent type and scored against the current query.
 * Respects a token budget (rough: 4 chars per token).
 */
export async function buildMemoryContext(
  agentType = 'general',
  query = '',
  tokenBudget = 500,
): Promise<string> {
  const relevantCategories = AGENT_CATEGORY_MAP[agentType] ?? AGENT_CATEGORY_MAP.general
  const allMemories = await getAllMemories()

  // Filter to relevant categories
  const filtered = allMemories.filter(m => relevantCategories.includes(m.category))

  if (filtered.length === 0) return ''

  // Score and sort by relevance
  const scored = filtered
    .map(m => ({ memory: m, score: scoreRelevance(m, query) }))
    .sort((a, b) => b.score - a.score)

  // Build context within token budget
  const charBudget = tokenBudget * 4
  const lines: string[] = []
  let charCount = 0

  for (const { memory } of scored) {
    const line = `- ${memory.key} [${memory.category}]: ${memory.value}`
    if (charCount + line.length > charBudget) break
    lines.push(line)
    charCount += line.length
  }

  if (lines.length === 0) return ''

  return [
    '',
    'User context (remembered from previous conversations):',
    ...lines,
  ].join('\n')
}
```

**Step 3: Commit**

```bash
git add packages/editor/src/mp/memory.ts packages/editor/src/utils/db.ts && git commit -m "feat: upgrade memory system — tiered storage with categories, decay, promotion"
```

---

### Task 4: Update agent-router.ts — new imports and expanded agent types

**Files:**
- Modify: `packages/editor/src/mp/agent-router.ts`

**Step 1: Replace agent-router.ts**

```typescript
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
// Intent detection — regex fast path + keyword matching
// ---------------------------------------------------------------------------
export function detectAgentType(message: string): AgentType {
  // Fast path: regex matching
  for (const skill of AGENT_SKILLS) {
    if (skill.triggers.regex.some(p => p.test(message))) return skill.id
  }

  // Secondary: keyword overlap scoring
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
// Build conversation payload (system + memory + last N messages)
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
// Cost estimation for pre-dispatch approval
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
// Retry utility with exponential backoff
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
      // Only retry on retryable status codes
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

    const response = await withRetry(() =>
      provider.complete(apiKeyEntry.apiKey, {
        model,
        messages: buildMessages(allMessages, agentType, userMessage) as any,
      })
    )

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
```

Note: `buildMessages` is async but we need to await it. Fix the call in `routeMessage`:

Replace the provider.complete call with:

```typescript
const builtMessages = await buildMessages(allMessages, agentType, userMessage)
const response = await withRetry(() =>
  provider.complete(apiKeyEntry.apiKey, {
    model,
    messages: builtMessages,
  })
)
```

**Step 2: Commit**

```bash
git add packages/editor/src/mp/agent-router.ts && git commit -m "feat: upgrade agent router — 8 agent skills, retry logic, keyword scoring"
```

---

### Task 5: Update chatStore — expanded AgentType union

**Files:**
- Modify: `packages/editor/src/store/chatStore.ts`

**Step 1: Update AgentType on line 6**

Replace:
```typescript
export type AgentType = 'content' | 'design' | 'code' | 'seo' | 'general'
```

With:
```typescript
export type AgentType = 'content' | 'design' | 'code' | 'seo' | 'deploy' | 'commerce' | 'research' | 'analytics' | 'general'
```

**Step 2: Commit**

```bash
git add packages/editor/src/store/chatStore.ts && git commit -m "feat: expand AgentType union with deploy, commerce, research, analytics"
```

---

### Task 6: Rebrand Moneypenny.tsx → MP.tsx

**Files:**
- Rename: `packages/editor/src/components/Moneypenny.tsx` → `packages/editor/src/components/MP.tsx`
- Modify: `packages/editor/src/components/MP.tsx`

**Step 1: Rename the file**

```bash
cd packages/editor/src/components && mv Moneypenny.tsx MP.tsx
```

**Step 2: Update imports in MP.tsx**

Change line 8:
```typescript
import { routeMessage } from '../mp/agent-router'
```

**Step 3: Rename the component**

Replace `export default function Moneypenny()` (line 99) with:
```typescript
export default function MP()
```

**Step 4: Update all "Moneypenny" text in the component**

- Line 148: `'Moneypenny'` → `'MP'`
- Line 162: `Moneypenny` → `MP` (the h2 text)
- Line 203-204: `"Hello. I'm Moneypenny. What are we building today?"` → `"Hello. I'm MP. What are we building today?"`
- Line 209: `"Hello. I'm Moneypenny."` → `"Hello. I'm MP."`
- Line 241: `'Ask Moneypenny...'` → `'Ask MP...'`

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: rebrand Moneypenny.tsx to MP.tsx with updated identity"
```

---

### Task 7: Update App.tsx — new import paths

**Files:**
- Modify: `packages/editor/src/App.tsx`

**Step 1: Update imports**

Replace line 13:
```typescript
import Moneypenny from './components/Moneypenny'
```
With:
```typescript
import MP from './components/MP'
```

**Step 2: Update JSX**

Replace line 111:
```typescript
<Moneypenny />
```
With:
```typescript
<MP />
```

**Step 3: Update onboarding messages**

In the `handleOnboardingChoice` callback, update any mention of "Moneypenny" in the tour message text (around line 39-77). The system prompt references are already updated.

**Step 4: Commit**

```bash
git add packages/editor/src/App.tsx && git commit -m "refactor: update App.tsx imports — Moneypenny to MP"
```

---

### Task 8: Update Onboarding.tsx — MP branding

**Files:**
- Modify: `packages/editor/src/components/Onboarding.tsx`

**Step 1: Update the title text**

Replace line 88:
```
          Moneypenny
```
With:
```
          MP
```

**Step 2: Update subtitle**

Replace line 110:
```
          Your AI website architect
```
With:
```
          The augmenting intelligence platform
```

**Step 3: Commit**

```bash
git add packages/editor/src/components/Onboarding.tsx && git commit -m "refactor: update Onboarding — Moneypenny to MP"
```

---

### Task 9: Add streaming to provider types

**Files:**
- Modify: `packages/editor/src/providers/types.ts`

**Step 1: Add StreamingCompletionRequest and update ModelProvider**

Add after `CompletionResponse` interface (after line 24):

```typescript
export interface StreamingCompletionRequest extends CompletionRequest {
  onToken: (token: string) => void
  onComplete?: (response: CompletionResponse) => void
}
```

Add `stream` method to `ModelProvider` interface (after line 44):

```typescript
  /** Send a streaming chat-completion request. Optional — falls back to complete() */
  stream?(apiKey: string, req: StreamingCompletionRequest): Promise<CompletionResponse>;
```

**Step 2: Commit**

```bash
git add packages/editor/src/providers/types.ts && git commit -m "feat: add streaming types to provider interface"
```

---

### Task 10: Add streaming to Anthropic provider

**Files:**
- Modify: `packages/editor/src/providers/anthropic.ts`

**Step 1: Add stream function after the existing complete function (after line 97)**

```typescript
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
  if (systemMsg) body.system = systemMsg.content;
  if (req.temperature !== undefined) body.temperature = req.temperature;

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
  let fullContent = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;

      try {
        const event = JSON.parse(data);
        if (event.type === 'content_block_delta' && event.delta?.text) {
          fullContent += event.delta.text;
          req.onToken(event.delta.text);
        } else if (event.type === 'message_delta' && event.usage) {
          outputTokens = event.usage.output_tokens ?? outputTokens;
        } else if (event.type === 'message_start' && event.message?.usage) {
          inputTokens = event.message.usage.input_tokens ?? 0;
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  const response: CompletionResponse = {
    content: fullContent,
    model: req.model,
    inputTokens,
    outputTokens,
    costEstimate: estimateCost(req.model, inputTokens, outputTokens),
  };

  req.onComplete?.(response);
  return response;
}
```

**Step 2: Add StreamingCompletionRequest import**

Update the import at the top:
```typescript
import type {
  CompletionRequest,
  CompletionResponse,
  Message,
  ModelInfo,
  ModelProvider,
  StreamingCompletionRequest,
} from './types';
```

**Step 3: Add stream to provider export**

Update the export (line 116-123):
```typescript
export const anthropicProvider: ModelProvider = {
  name: 'Anthropic',
  id: 'anthropic',
  models,
  complete,
  stream,
  estimateCost,
  validateKey,
};
```

**Step 4: Commit**

```bash
git add packages/editor/src/providers/anthropic.ts && git commit -m "feat: add streaming support to Anthropic provider"
```

---

### Task 11: Add streaming to OpenAI provider

**Files:**
- Modify: `packages/editor/src/providers/openai.ts`

**Step 1: Add import and stream function**

Add `StreamingCompletionRequest` to imports. Add stream function after complete:

```typescript
async function stream(
  apiKey: string,
  req: StreamingCompletionRequest,
): Promise<CompletionResponse> {
  const messages = req.messages.map((m) => ({ role: m.role, content: m.content }));

  const body: Record<string, unknown> = {
    model: req.model,
    messages,
    max_tokens: req.maxTokens ?? 4096,
    stream: true,
    stream_options: { include_usage: true },
  };
  if (req.temperature !== undefined) body.temperature = req.temperature;

  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;

      try {
        const event = JSON.parse(data);
        if (event.choices?.[0]?.delta?.content) {
          const token = event.choices[0].delta.content;
          fullContent += token;
          req.onToken(token);
        }
        if (event.usage) {
          inputTokens = event.usage.prompt_tokens ?? inputTokens;
          outputTokens = event.usage.completion_tokens ?? outputTokens;
        }
      } catch {
        // Skip malformed lines
      }
    }
  }

  const response: CompletionResponse = {
    content: fullContent,
    model: req.model,
    inputTokens,
    outputTokens,
    costEstimate: estimateCost(req.model, inputTokens, outputTokens),
  };

  req.onComplete?.(response);
  return response;
}
```

**Step 2: Add stream to export**

**Step 3: Commit**

```bash
git add packages/editor/src/providers/openai.ts && git commit -m "feat: add streaming support to OpenAI provider"
```

---

### Task 12: Add streaming to Google and Mistral providers

**Files:**
- Modify: `packages/editor/src/providers/google.ts`
- Modify: `packages/editor/src/providers/mistral.ts`

Follow the same SSE streaming pattern as Tasks 10-11 for each provider. Google uses `streamGenerateContent?alt=sse` endpoint. Mistral uses the same OpenAI-compatible SSE format.

**Commit:**

```bash
git add packages/editor/src/providers/google.ts packages/editor/src/providers/mistral.ts && git commit -m "feat: add streaming support to Google and Mistral providers"
```

---

### Task 13: Add streaming to chat UI (MP.tsx)

**Files:**
- Modify: `packages/editor/src/components/MP.tsx`
- Modify: `packages/editor/src/mp/agent-router.ts`

**Step 1: Add streaming message state to chatStore**

In `packages/editor/src/store/chatStore.ts`, add to state:

```typescript
streamingContent: string
setStreamingContent: (content: string) => void
appendStreamingContent: (token: string) => void
```

And in the store implementation:

```typescript
streamingContent: '',
setStreamingContent: (content) => set({ streamingContent: content }),
appendStreamingContent: (token) => set((s) => ({ streamingContent: s.streamingContent + token })),
```

**Step 2: Update MP.tsx to show streaming content**

After the `{isProcessing && <TypingIndicator />}` block (around line 230), add:

```typescript
{isProcessing && streamingContent && (
  <div className="flex justify-start animate-mp-fade-in">
    <div className="max-w-[85%] rounded-lg border-l-2 border-mp-gold/40 bg-transparent px-4 py-2.5 text-mp-text">
      <p className="whitespace-pre-wrap text-sm leading-relaxed font-mp-body">
        {streamingContent}
        <span className="inline-block w-1 h-4 ml-0.5 bg-mp-gold animate-pulse" />
      </p>
    </div>
  </div>
)}
```

And destructure `streamingContent` from `useChatStore()`.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: streaming token-by-token display in chat UI"
```

---

### Task 14: Add response caching layer

**Files:**
- Create: `packages/editor/src/mp/cache.ts`

**Step 1: Create cache.ts**

```typescript
// ---------------------------------------------------------------------------
// Response cache — content-hash based, IndexedDB backed
// ---------------------------------------------------------------------------
import { db } from '../utils/db'

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

interface CacheEntry {
  id?: number
  hash: string
  response: string
  model: string
  inputTokens: number
  outputTokens: number
  costEstimate: number
  createdAt: number
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function getCachedResponse(
  systemPrompt: string,
  lastMessage: string,
): Promise<CacheEntry | undefined> {
  const hash = await hashString(systemPrompt + '|' + lastMessage)

  // Check if we have responseCache table
  if (!db.tables.some(t => t.name === 'responseCache')) return undefined

  const entry = await (db as any).responseCache.where('hash').equals(hash).first()
  if (!entry) return undefined

  // Check TTL
  if (Date.now() - entry.createdAt > CACHE_TTL) {
    await (db as any).responseCache.delete(entry.id)
    return undefined
  }

  return entry
}

export async function setCachedResponse(
  systemPrompt: string,
  lastMessage: string,
  response: CacheEntry,
): Promise<void> {
  const hash = await hashString(systemPrompt + '|' + lastMessage)

  if (!db.tables.some(t => t.name === 'responseCache')) return

  await (db as any).responseCache.put({
    ...response,
    hash,
    createdAt: Date.now(),
  })
}
```

**Step 2: Add responseCache table to db.ts**

In the `db.version(5)` stores, add:
```typescript
responseCache: '++id, hash, createdAt',
```

**Step 3: Commit**

```bash
git add packages/editor/src/mp/cache.ts packages/editor/src/utils/db.ts && git commit -m "feat: add response caching layer with SHA-256 content hashing"
```

---

### Task 15: Add fallback chain support to aiStore

**Files:**
- Modify: `packages/editor/src/store/aiStore.ts`

**Step 1: Add FallbackChain interface and state**

Add after `TaskRoute` interface (line 15):

```typescript
export interface FallbackChain {
  primary: { providerId: string; model: string }
  secondary?: { providerId: string; model: string }
  useFreetier?: boolean
}
```

Add to AiState interface:
```typescript
fallbackChain: FallbackChain | null
setFallbackChain: (chain: FallbackChain | null) => void
```

Add to store implementation:
```typescript
fallbackChain: null,
setFallbackChain: (chain) => set({ fallbackChain: chain }),
```

**Step 2: Commit**

```bash
git add packages/editor/src/store/aiStore.ts && git commit -m "feat: add fallback chain configuration to aiStore"
```

---

### Task 16: Update provider index.ts — export streaming type

**Files:**
- Modify: `packages/editor/src/providers/index.ts`

**Step 1: Add StreamingCompletionRequest to exports**

```typescript
export type {
  Message,
  CompletionRequest,
  CompletionResponse,
  StreamingCompletionRequest,
  ModelInfo,
  ModelProvider,
} from './types';
```

**Step 2: Commit**

```bash
git add packages/editor/src/providers/index.ts && git commit -m "refactor: export StreamingCompletionRequest from providers"
```

---

## BLOCK 2 — Intelligence Layer (Depends on Block 1)

---

### Task 17: Collections system — Dexie schema and CRUD

**Files:**
- Create: `packages/editor/src/mp/collections.ts`
- Modify: `packages/editor/src/utils/db.ts` (tables already added in Task 3)

**Step 1: Create collections.ts**

```typescript
// ---------------------------------------------------------------------------
// Collections — local-first structured data CMS
// ---------------------------------------------------------------------------
import { db } from '../utils/db'

export type FieldType = 'text' | 'richtext' | 'number' | 'boolean' | 'date' | 'image' | 'reference'

export interface CollectionField {
  name: string
  type: FieldType
  required: boolean
  referenceCollection?: string
}

export interface Collection {
  id?: number
  name: string
  slug: string
  schema: CollectionField[]
  createdAt: number
  updatedAt: number
}

export interface CollectionItem {
  id?: number
  collectionId: number
  data: Record<string, unknown>
  version: number
  createdAt: number
  updatedAt: number
}

// --- Collection CRUD ---

export async function createCollection(
  name: string,
  schema: CollectionField[],
): Promise<number> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const now = Date.now()
  return await (db as any).collections.add({
    name,
    slug,
    schema: JSON.stringify(schema),
    createdAt: now,
    updatedAt: now,
  })
}

export async function getCollection(id: number): Promise<Collection | undefined> {
  const record = await (db as any).collections.get(id)
  if (!record) return undefined
  return { ...record, schema: JSON.parse(record.schema) }
}

export async function getAllCollections(): Promise<Collection[]> {
  const records = await (db as any).collections.toArray()
  return records.map((r: any) => ({ ...r, schema: JSON.parse(r.schema) }))
}

export async function updateCollectionSchema(
  id: number,
  schema: CollectionField[],
): Promise<void> {
  await (db as any).collections.update(id, {
    schema: JSON.stringify(schema),
    updatedAt: Date.now(),
  })
}

export async function deleteCollection(id: number): Promise<void> {
  await (db as any).collections.delete(id)
  // Also delete all items in this collection
  await (db as any).collectionItems.where('collectionId').equals(id).delete()
}

// --- Item CRUD ---

export async function addItem(
  collectionId: number,
  data: Record<string, unknown>,
): Promise<number> {
  const now = Date.now()
  return await (db as any).collectionItems.add({
    collectionId,
    data: JSON.stringify(data),
    version: 1,
    createdAt: now,
    updatedAt: now,
  })
}

export async function getItems(collectionId: number): Promise<CollectionItem[]> {
  const records = await (db as any).collectionItems
    .where('collectionId')
    .equals(collectionId)
    .toArray()
  return records.map((r: any) => ({ ...r, data: JSON.parse(r.data) }))
}

export async function updateItem(
  id: number,
  data: Record<string, unknown>,
): Promise<void> {
  const existing = await (db as any).collectionItems.get(id)
  if (!existing) return
  await (db as any).collectionItems.update(id, {
    data: JSON.stringify(data),
    version: (existing.version ?? 0) + 1,
    updatedAt: Date.now(),
  })
}

export async function deleteItem(id: number): Promise<void> {
  await (db as any).collectionItems.delete(id)
}
```

**Step 2: Commit**

```bash
git add packages/editor/src/mp/collections.ts && git commit -m "feat: add collections CMS — local-first structured data with versioning"
```

---

### Task 18: Voice pipeline — browser STT/TTS

**Files:**
- Create: `packages/editor/src/mp/voice.ts`

**Step 1: Create voice.ts**

```typescript
// ---------------------------------------------------------------------------
// Voice Pipeline — browser-native STT/TTS with abstracted interfaces
// ---------------------------------------------------------------------------

// --- Speech-to-Text ---

export interface STTAdapter {
  start(): void
  stop(): void
  onResult: ((text: string) => void) | null
  onError: ((error: string) => void) | null
  isListening: boolean
}

class WebSpeechSTT implements STTAdapter {
  private recognition: SpeechRecognition | null = null
  onResult: ((text: string) => void) | null = null
  onError: ((error: string) => void) | null = null
  isListening = false

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = 'en-GB'

    this.recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      this.onResult?.(transcript)
    }

    this.recognition.onerror = (event) => {
      this.isListening = false
      this.onError?.(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
    }
  }

  start() {
    if (!this.recognition) {
      this.onError?.('Speech recognition not supported in this browser.')
      return
    }
    this.isListening = true
    this.recognition.start()
  }

  stop() {
    this.isListening = false
    this.recognition?.stop()
  }
}

// --- Text-to-Speech ---

export interface TTSAdapter {
  speak(text: string): Promise<void>
  stop(): void
  isSpeaking: boolean
}

class WebSpeechTTS implements TTSAdapter {
  isSpeaking = false
  private voice: SpeechSynthesisVoice | null = null

  constructor() {
    // Find a British English voice
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      this.voice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Female'))
        ?? voices.find(v => v.lang === 'en-GB')
        ?? voices.find(v => v.lang.startsWith('en'))
        ?? null
    }
    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      if (this.voice) utterance.voice = this.voice
      utterance.lang = 'en-GB'
      utterance.rate = 0.95
      utterance.pitch = 1.0

      this.isSpeaking = true
      utterance.onend = () => {
        this.isSpeaking = false
        resolve()
      }
      utterance.onerror = () => {
        this.isSpeaking = false
        resolve()
      }

      speechSynthesis.speak(utterance)
    })
  }

  stop() {
    speechSynthesis.cancel()
    this.isSpeaking = false
  }
}

// --- Factory ---

export function createSTT(): STTAdapter {
  return new WebSpeechSTT()
}

export function createTTS(): TTSAdapter {
  return new WebSpeechTTS()
}
```

**Step 2: Commit**

```bash
git add packages/editor/src/mp/voice.ts && git commit -m "feat: add voice pipeline — browser STT/TTS with adapter abstraction"
```

---

### Task 19: REFERRED catalog integration

**Files:**
- Create: `packages/editor/src/mp/referred.ts`

**Step 1: Create referred.ts**

```typescript
// ---------------------------------------------------------------------------
// REFERRED Integration — catalog knowledge base for MP
// ---------------------------------------------------------------------------

export interface ReferredProduct {
  id: string
  company: string
  name: string
  category: string
  description: string
  priceRange: string
  regions: string[]
  affiliateUrl?: string
  amazonUrl?: string
  beginnerFriendly: boolean
  tags: string[]
}

// Cached catalog — loaded once from Supabase, stored in memory
let catalogCache: ReferredProduct[] = []
let lastFetch = 0
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

/**
 * Fetch the REFERRED catalog from Supabase public API.
 * Caches in memory with 30-minute TTL.
 */
export async function fetchCatalog(supabaseUrl?: string, supabaseKey?: string): Promise<ReferredProduct[]> {
  if (catalogCache.length > 0 && Date.now() - lastFetch < CACHE_TTL) {
    return catalogCache
  }

  if (!supabaseUrl || !supabaseKey) {
    return catalogCache // Return whatever we have
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*,companies(name,category)`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!res.ok) return catalogCache

    const data = await res.json()
    catalogCache = data.map((item: any) => ({
      id: item.id,
      company: item.companies?.name ?? '',
      name: item.name,
      category: item.companies?.category ?? '',
      description: item.description ?? '',
      priceRange: item.price_range ?? '',
      regions: item.regions ?? [],
      affiliateUrl: item.affiliate_url,
      amazonUrl: item.amazon_url,
      beginnerFriendly: item.beginner_friendly ?? false,
      tags: item.tags ?? [],
    }))
    lastFetch = Date.now()
    return catalogCache
  } catch {
    return catalogCache
  }
}

/**
 * Search the catalog by query string.
 * Simple keyword matching against name, company, category, tags.
 */
export function searchCatalog(
  query: string,
  filters?: {
    category?: string
    region?: string
    beginnerFriendly?: boolean
  },
): ReferredProduct[] {
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2)

  return catalogCache
    .filter(product => {
      // Apply filters
      if (filters?.category && product.category !== filters.category) return false
      if (filters?.region && !product.regions.includes(filters.region)) return false
      if (filters?.beginnerFriendly !== undefined && product.beginnerFriendly !== filters.beginnerFriendly) return false

      // Keyword match
      if (queryWords.length === 0) return true
      const searchable = `${product.name} ${product.company} ${product.category} ${product.tags.join(' ')} ${product.description}`.toLowerCase()
      return queryWords.some(w => searchable.includes(w))
    })
    .slice(0, 20) // Limit results
}

/**
 * Get recommendations for a category, formatted for MP to present.
 */
export function getRecommendations(category: string, limit = 5): ReferredProduct[] {
  return catalogCache
    .filter(p => p.category.toLowerCase() === category.toLowerCase())
    .slice(0, limit)
}
```

**Step 2: Commit**

```bash
git add packages/editor/src/mp/referred.ts && git commit -m "feat: add REFERRED catalog integration — search, recommendations, caching"
```

---

### Task 20: MP Remembers UI panel in Settings

**Files:**
- Modify: `packages/editor/src/components/SettingsModal.tsx`

**Step 1: Add memory section to SettingsModal**

Add imports at the top:
```typescript
import { useEffect, useCallback, useState } from 'react'
import { getAllMemories, deleteMemory, type MemoryEntry } from '../mp/memory'
```

Add state for memories inside the component:
```typescript
const [memories, setMemories] = useState<MemoryEntry[]>([])

useEffect(() => {
  getAllMemories().then(setMemories)
}, [showSettings])

const handleDeleteMemory = async (key: string) => {
  await deleteMemory(key)
  setMemories(prev => prev.filter(m => m.key !== key))
}
```

Add a new section after the "Default Model" section:

```typescript
{/* MP Remembers */}
<section>
  <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-mp-muted">
    MP Remembers
  </h3>
  {memories.length === 0 ? (
    <p className="text-xs text-mp-muted">
      No memories stored yet. MP will learn your preferences as you work together.
    </p>
  ) : (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {memories.map((m) => (
        <div key={m.key} className="flex items-start justify-between gap-2 rounded border border-mp-border bg-mp-bg p-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-mp-text truncate">{m.key}</span>
              <span className="shrink-0 rounded bg-mp-gold/10 px-1.5 py-0.5 text-[9px] font-medium text-mp-gold uppercase">
                {m.category}
              </span>
            </div>
            <p className="mt-1 text-xs text-mp-muted truncate">{m.value}</p>
          </div>
          <button
            onClick={() => handleDeleteMemory(m.key)}
            className="shrink-0 rounded p-1 text-mp-muted transition-colors hover:text-mp-red"
            title="Forget this"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  )}
</section>
```

**Step 2: Commit**

```bash
git add packages/editor/src/components/SettingsModal.tsx && git commit -m "feat: add 'MP Remembers' panel to Settings — view and delete memories"
```

---

### Task 21: Voice toggle in settings and mic button in chat

**Files:**
- Modify: `packages/editor/src/store/aiStore.ts`
- Modify: `packages/editor/src/components/MP.tsx`
- Modify: `packages/editor/src/components/SettingsModal.tsx`

**Step 1: Add voice settings to aiStore**

Add to AiState interface and implementation:
```typescript
voiceEnabled: boolean
setVoiceEnabled: (enabled: boolean) => void
```

```typescript
voiceEnabled: false,
setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
```

**Step 2: Add voice toggle to SettingsModal**

Add a section after Monthly Budget:
```typescript
<section>
  <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-mp-muted">
    Voice
  </h3>
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={voiceEnabled}
      onChange={(e) => setVoiceEnabled(e.target.checked)}
      className="rounded border-mp-border"
    />
    <span className="text-sm text-mp-text">Enable voice input and output</span>
  </label>
</section>
```

**Step 3: Add microphone button to MP.tsx**

Import voice module and add mic button next to the text input when voice is enabled. Use `createSTT()` for recording and `createTTS()` to speak responses.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add voice toggle in settings and microphone button in chat"
```

---

### Task 22: Final integration pass — verify all imports resolve

**Step 1: Run TypeScript type checking**

```bash
cd packages/editor && npx tsc --noEmit
```

Fix any import errors, missing types, or broken references.

**Step 2: Run the dev server**

```bash
pnpm dev
```

Verify the app loads, Onboarding shows "MP", chat works, settings open.

**Step 3: Commit any fixes**

```bash
git add -A && git commit -m "fix: resolve import errors from MP rebrand and new modules"
```

---

### Task 23: Final commit — consolidation

**Step 1: Verify clean build**

```bash
cd packages/editor && npx vite build
```

**Step 2: Tag the milestone**

```bash
git tag -a v0.2.0-mp -m "MP Platform — rebrand, tiered memory, streaming providers, agent swarm, voice, collections, REFERRED"
```

---

## Summary

**22 implementation tasks** across 3 blocks:

| Block | Tasks | Scope |
|-------|-------|-------|
| 1 (parallel) | 1-16 | Rebrand, memory upgrade, provider streaming/retry/fallback, agent swarm expansion |
| 2 (sequential on Block 1) | 17-21 | Collections CMS, voice pipeline, REFERRED integration, UI panels |
| 3 (final) | 22-23 | Integration verification, build, tag |

**Key files created:**
- `packages/editor/src/mp/cache.ts`
- `packages/editor/src/mp/collections.ts`
- `packages/editor/src/mp/voice.ts`
- `packages/editor/src/mp/referred.ts`

**Key files modified:**
- All files under `mp/` (formerly `moneypenny/`)
- All 4 provider adapters (streaming added)
- `chatStore.ts` (expanded types, streaming state)
- `aiStore.ts` (fallback chains, voice toggle)
- `db.ts` (schema v5 with new tables)
- `MP.tsx` (rebrand + streaming UI + voice)
- `SettingsModal.tsx` (memory panel, voice toggle)
- `App.tsx`, `Onboarding.tsx` (rebrand)
