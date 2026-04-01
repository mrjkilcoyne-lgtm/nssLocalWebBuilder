# Moneypenny Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the Moneypenny AI concierge as the primary interface — chat command bar, BYOK model configuration, agent router with cost tracking, persistent memory, and transparent orchestration feed. Integrate with existing GrapesJS editor.

**Architecture:** Moneypenny lives as a persistent command bar at the bottom of every view (dashboard + editor). She routes user requests to configured AI models via a provider-agnostic adapter layer. An agent orchestrator manages specialised agents (content, design, code, SEO, deploy). All state persists in IndexedDB via Dexie. Cost estimation happens before every API call.

**Tech Stack:** React 18, Zustand, Dexie (IndexedDB), WebLLM (in-browser inference), provider adapters for Anthropic/OpenAI/Google/Mistral/Cohere APIs, Web Speech API (TTS fallback).

---

## Task 1: BYOK Model Provider Adapters

**Files:**
- Create: `packages/editor/src/providers/types.ts`
- Create: `packages/editor/src/providers/anthropic.ts`
- Create: `packages/editor/src/providers/openai.ts`
- Create: `packages/editor/src/providers/google.ts`
- Create: `packages/editor/src/providers/mistral.ts`
- Create: `packages/editor/src/providers/index.ts`

**Step 1: Create the provider interface**

```typescript
// packages/editor/src/providers/types.ts
export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CompletionRequest {
  messages: Message[]
  model: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface CompletionResponse {
  content: string
  model: string
  inputTokens: number
  outputTokens: number
  costEstimate: number // in GBP
}

export interface ModelProvider {
  name: string
  id: string
  models: ModelInfo[]
  complete(apiKey: string, req: CompletionRequest): Promise<CompletionResponse>
  estimateCost(model: string, inputTokens: number, outputTokens: number): number
  validateKey(apiKey: string): Promise<boolean>
}

export interface ModelInfo {
  id: string
  name: string
  inputPricePer1M: number  // USD per 1M tokens
  outputPricePer1M: number
  maxContext: number
}
```

**Step 2: Implement Anthropic adapter**

```typescript
// packages/editor/src/providers/anthropic.ts
import type { ModelProvider, CompletionRequest, CompletionResponse, ModelInfo } from './types'

const MODELS: ModelInfo[] = [
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', inputPricePer1M: 3, outputPricePer1M: 15, maxContext: 200000 },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', inputPricePer1M: 0.8, outputPricePer1M: 4, maxContext: 200000 },
]

export const anthropicProvider: ModelProvider = {
  name: 'Anthropic',
  id: 'anthropic',
  models: MODELS,

  async complete(apiKey, req) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens ?? 2048,
        temperature: req.temperature ?? 0.7,
        messages: req.messages.filter(m => m.role !== 'system'),
        system: req.messages.find(m => m.role === 'system')?.content,
      }),
    })
    const data = await res.json()
    const inputTokens = data.usage?.input_tokens ?? 0
    const outputTokens = data.usage?.output_tokens ?? 0
    return {
      content: data.content?.[0]?.text ?? '',
      model: req.model,
      inputTokens,
      outputTokens,
      costEstimate: this.estimateCost(req.model, inputTokens, outputTokens),
    }
  },

  estimateCost(model, inputTokens, outputTokens) {
    const info = MODELS.find(m => m.id === model) ?? MODELS[0]
    const usd = (inputTokens / 1_000_000) * info.inputPricePer1M + (outputTokens / 1_000_000) * info.outputPricePer1M
    return usd * 0.79 // rough USD to GBP
  },

  async validateKey(apiKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
      })
      return res.ok
    } catch { return false }
  },
}
```

**Step 3: Implement OpenAI adapter**

```typescript
// packages/editor/src/providers/openai.ts
import type { ModelProvider, CompletionRequest, CompletionResponse, ModelInfo } from './types'

const MODELS: ModelInfo[] = [
  { id: 'gpt-4o', name: 'GPT-4o', inputPricePer1M: 2.5, outputPricePer1M: 10, maxContext: 128000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', inputPricePer1M: 0.15, outputPricePer1M: 0.6, maxContext: 128000 },
]

export const openaiProvider: ModelProvider = {
  name: 'OpenAI',
  id: 'openai',
  models: MODELS,

  async complete(apiKey, req) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens ?? 2048,
        temperature: req.temperature ?? 0.7,
        messages: req.messages,
      }),
    })
    const data = await res.json()
    const inputTokens = data.usage?.prompt_tokens ?? 0
    const outputTokens = data.usage?.completion_tokens ?? 0
    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: req.model,
      inputTokens,
      outputTokens,
      costEstimate: this.estimateCost(req.model, inputTokens, outputTokens),
    }
  },

  estimateCost(model, inputTokens, outputTokens) {
    const info = MODELS.find(m => m.id === model) ?? MODELS[0]
    const usd = (inputTokens / 1_000_000) * info.inputPricePer1M + (outputTokens / 1_000_000) * info.outputPricePer1M
    return usd * 0.79
  },

  async validateKey(apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      return res.ok
    } catch { return false }
  },
}
```

**Step 4: Implement Google Gemini adapter**

```typescript
// packages/editor/src/providers/google.ts
import type { ModelProvider, CompletionRequest, CompletionResponse, ModelInfo } from './types'

const MODELS: ModelInfo[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', inputPricePer1M: 0.15, outputPricePer1M: 0.6, maxContext: 1000000 },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', inputPricePer1M: 1.25, outputPricePer1M: 10, maxContext: 1000000 },
]

export const googleProvider: ModelProvider = {
  name: 'Google',
  id: 'google',
  models: MODELS,

  async complete(apiKey, req) {
    const systemMsg = req.messages.find(m => m.role === 'system')
    const chatMsgs = req.messages.filter(m => m.role !== 'system')
    const contents = chatMsgs.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${req.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
          generationConfig: { maxOutputTokens: req.maxTokens ?? 2048, temperature: req.temperature ?? 0.7 },
        }),
      }
    )
    const data = await res.json()
    const inputTokens = data.usageMetadata?.promptTokenCount ?? 0
    const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
      model: req.model,
      inputTokens,
      outputTokens,
      costEstimate: this.estimateCost(req.model, inputTokens, outputTokens),
    }
  },

  estimateCost(model, inputTokens, outputTokens) {
    const info = MODELS.find(m => m.id === model) ?? MODELS[0]
    const usd = (inputTokens / 1_000_000) * info.inputPricePer1M + (outputTokens / 1_000_000) * info.outputPricePer1M
    return usd * 0.79
  },

  async validateKey(apiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
      return res.ok
    } catch { return false }
  },
}
```

**Step 5: Implement Mistral adapter**

```typescript
// packages/editor/src/providers/mistral.ts
import type { ModelProvider, CompletionRequest, CompletionResponse, ModelInfo } from './types'

const MODELS: ModelInfo[] = [
  { id: 'mistral-small-latest', name: 'Mistral Small', inputPricePer1M: 0.1, outputPricePer1M: 0.3, maxContext: 32000 },
  { id: 'mistral-large-latest', name: 'Mistral Large', inputPricePer1M: 2, outputPricePer1M: 6, maxContext: 128000 },
]

export const mistralProvider: ModelProvider = {
  name: 'Mistral',
  id: 'mistral',
  models: MODELS,

  async complete(apiKey, req) {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens ?? 2048,
        temperature: req.temperature ?? 0.7,
        messages: req.messages,
      }),
    })
    const data = await res.json()
    const inputTokens = data.usage?.prompt_tokens ?? 0
    const outputTokens = data.usage?.completion_tokens ?? 0
    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: req.model,
      inputTokens,
      outputTokens,
      costEstimate: this.estimateCost(req.model, inputTokens, outputTokens),
    }
  },

  estimateCost(model, inputTokens, outputTokens) {
    const info = MODELS.find(m => m.id === model) ?? MODELS[0]
    const usd = (inputTokens / 1_000_000) * info.inputPricePer1M + (outputTokens / 1_000_000) * info.outputPricePer1M
    return usd * 0.79
  },

  async validateKey(apiKey) {
    try {
      const res = await fetch('https://api.mistral.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      return res.ok
    } catch { return false }
  },
}
```

**Step 6: Create provider registry**

```typescript
// packages/editor/src/providers/index.ts
import { anthropicProvider } from './anthropic'
import { openaiProvider } from './openai'
import { googleProvider } from './google'
import { mistralProvider } from './mistral'
import type { ModelProvider } from './types'

export const providers: Record<string, ModelProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  google: googleProvider,
  mistral: mistralProvider,
}

export function getProvider(id: string): ModelProvider | undefined {
  return providers[id]
}

export function getAllProviders(): ModelProvider[] {
  return Object.values(providers)
}

export { type ModelProvider, type CompletionRequest, type CompletionResponse, type Message, type ModelInfo } from './types'
```

**Step 7: Commit**

```bash
git add packages/editor/src/providers/
git commit -m "feat: add BYOK model provider adapters (Anthropic, OpenAI, Google, Mistral)"
```

---

## Task 2: AI Configuration Store + Settings UI

**Files:**
- Create: `packages/editor/src/store/aiStore.ts`
- Create: `packages/editor/src/components/SettingsModal.tsx`
- Modify: `packages/editor/src/utils/db.ts` — add AI config table
- Modify: `packages/editor/src/components/Toolbar.tsx` — add settings button

**Step 1: Create AI store with cost tracking**

```typescript
// packages/editor/src/store/aiStore.ts
import { create } from 'zustand'

export interface ApiKeyConfig {
  providerId: string
  apiKey: string
  validated: boolean
}

export interface CostRecord {
  timestamp: number
  providerId: string
  model: string
  inputTokens: number
  outputTokens: number
  costGBP: number
  task: string
}

interface AiState {
  apiKeys: ApiKeyConfig[]
  defaultProvider: string
  defaultModel: string
  taskRouting: Record<string, { providerId: string; model: string }>
  monthlyBudgetGBP: number
  costHistory: CostRecord[]
  showSettings: boolean

  setApiKey: (providerId: string, apiKey: string) => void
  setKeyValidated: (providerId: string, validated: boolean) => void
  removeApiKey: (providerId: string) => void
  setDefault: (providerId: string, model: string) => void
  setTaskRoute: (task: string, providerId: string, model: string) => void
  setBudget: (amount: number) => void
  addCostRecord: (record: CostRecord) => void
  setShowSettings: (show: boolean) => void
  getMonthSpend: () => number
  getConfiguredProvider: () => ApiKeyConfig | undefined
}

export const useAiStore = create<AiState>((set, get) => ({
  apiKeys: [],
  defaultProvider: '',
  defaultModel: '',
  taskRouting: {},
  monthlyBudgetGBP: 10,
  costHistory: [],
  showSettings: false,

  setApiKey: (providerId, apiKey) =>
    set((s) => ({
      apiKeys: [
        ...s.apiKeys.filter((k) => k.providerId !== providerId),
        { providerId, apiKey, validated: false },
      ],
    })),

  setKeyValidated: (providerId, validated) =>
    set((s) => ({
      apiKeys: s.apiKeys.map((k) =>
        k.providerId === providerId ? { ...k, validated } : k
      ),
    })),

  removeApiKey: (providerId) =>
    set((s) => ({
      apiKeys: s.apiKeys.filter((k) => k.providerId !== providerId),
    })),

  setDefault: (providerId, model) =>
    set({ defaultProvider: providerId, defaultModel: model }),

  setTaskRoute: (task, providerId, model) =>
    set((s) => ({
      taskRouting: { ...s.taskRouting, [task]: { providerId, model } },
    })),

  setBudget: (amount) => set({ monthlyBudgetGBP: amount }),

  addCostRecord: (record) =>
    set((s) => ({ costHistory: [...s.costHistory, record] })),

  setShowSettings: (show) => set({ showSettings: show }),

  getMonthSpend: () => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    return get()
      .costHistory.filter((r) => r.timestamp >= monthStart)
      .reduce((sum, r) => sum + r.costGBP, 0)
  },

  getConfiguredProvider: () =>
    get().apiKeys.find((k) => k.providerId === get().defaultProvider && k.validated),
}))
```

**Step 2: Create Settings Modal UI**

```typescript
// packages/editor/src/components/SettingsModal.tsx
import { useState } from 'react'
import { X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { useAiStore } from '../store/aiStore'
import { getAllProviders, getProvider } from '../providers'

export default function SettingsModal() {
  const {
    apiKeys, defaultProvider, defaultModel, monthlyBudgetGBP,
    setApiKey, setKeyValidated, setDefault, setBudget,
    setShowSettings, getMonthSpend,
  } = useAiStore()
  const [validating, setValidating] = useState<string | null>(null)
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({})

  const handleSaveKey = async (providerId: string) => {
    const key = keyInputs[providerId]
    if (!key?.trim()) return
    setApiKey(providerId, key.trim())
    setValidating(providerId)
    const provider = getProvider(providerId)
    if (provider) {
      const valid = await provider.validateKey(key.trim())
      setKeyValidated(providerId, valid)
      if (valid && !defaultProvider) {
        setDefault(providerId, provider.models[0].id)
      }
    }
    setValidating(null)
  }

  const monthSpend = getMonthSpend()

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-surface border border-surface-border rounded-xl w-full max-w-lg max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <h2 className="text-lg font-semibold text-white">AI Model Configuration</h2>
          <button onClick={() => setShowSettings(false)} className="text-neutral-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Budget */}
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Monthly Budget (GBP)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={monthlyBudgetGBP}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-24 px-3 py-2 bg-surface-dark border border-surface-border rounded-lg text-sm text-white"
                min={0}
                step={1}
              />
              <span className="text-sm text-neutral-500">
                Spent this month: £{monthSpend.toFixed(4)}
              </span>
            </div>
          </div>

          {/* API Keys */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300 mb-3">API Keys</h3>
            <div className="space-y-3">
              {getAllProviders().map((provider) => {
                const existing = apiKeys.find((k) => k.providerId === provider.id)
                return (
                  <div key={provider.id} className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400 w-20">{provider.name}</span>
                    {existing?.validated ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <Check size={12} /> Connected
                        </span>
                        <span className="text-xs text-neutral-600">
                          {existing.apiKey.slice(0, 8)}...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="password"
                          placeholder="Paste API key..."
                          value={keyInputs[provider.id] ?? ''}
                          onChange={(e) => setKeyInputs({ ...keyInputs, [provider.id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-surface-dark border border-surface-border rounded text-xs text-white placeholder-neutral-600"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveKey(provider.id)}
                        />
                        <button
                          onClick={() => handleSaveKey(provider.id)}
                          disabled={validating === provider.id}
                          className="px-3 py-1.5 bg-accent rounded text-xs text-white disabled:opacity-50"
                        >
                          {validating === provider.id ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
                        </button>
                      </div>
                    )}
                    {existing && !existing.validated && (
                      <AlertCircle size={14} className="text-red-400" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Default Model */}
          {apiKeys.some((k) => k.validated) && (
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Default Model</label>
              <select
                value={`${defaultProvider}:${defaultModel}`}
                onChange={(e) => {
                  const [p, m] = e.target.value.split(':')
                  setDefault(p, m)
                }}
                className="w-full px-3 py-2 bg-surface-dark border border-surface-border rounded-lg text-sm text-white"
              >
                {apiKeys
                  .filter((k) => k.validated)
                  .flatMap((k) => {
                    const prov = getProvider(k.providerId)
                    return prov?.models.map((m) => (
                      <option key={`${k.providerId}:${m.id}`} value={`${k.providerId}:${m.id}`}>
                        {prov.name} — {m.name}
                      </option>
                    )) ?? []
                  })}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Add settings button to Toolbar**

In `packages/editor/src/components/Toolbar.tsx`, add `Settings` icon import and button next to Export. Also import and conditionally render SettingsModal.

**Step 4: Add AI config persistence to db.ts**

Add a new `aiConfig` table in Dexie to persist API keys, default model, budget, and cost history across sessions.

**Step 5: Commit**

```bash
git add packages/editor/src/store/aiStore.ts packages/editor/src/components/SettingsModal.tsx
git commit -m "feat: add AI settings store, BYOK key management UI, cost tracking"
```

---

## Task 3: Moneypenny Chat Interface

**Files:**
- Create: `packages/editor/src/components/Moneypenny.tsx`
- Create: `packages/editor/src/store/chatStore.ts`
- Create: `packages/editor/src/moneypenny/system-prompt.ts`
- Create: `packages/editor/src/moneypenny/agent-router.ts`
- Modify: `packages/editor/src/App.tsx` — add Moneypenny to all views

**Step 1: Create chat store**

```typescript
// packages/editor/src/store/chatStore.ts
import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  costGBP?: number
  model?: string
  agentType?: string
}

interface ChatState {
  messages: ChatMessage[]
  isProcessing: boolean
  isExpanded: boolean
  activeAgents: { id: string; type: string; status: string; model: string; costSoFar: number }[]

  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setProcessing: (processing: boolean) => void
  setExpanded: (expanded: boolean) => void
  addActiveAgent: (agent: { id: string; type: string; model: string }) => void
  updateAgent: (id: string, updates: Partial<{ status: string; costSoFar: number }>) => void
  removeAgent: (id: string) => void
  clearMessages: () => void
}

const genId = () => Math.random().toString(36).slice(2, 10)

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isProcessing: false,
  isExpanded: false,
  activeAgents: [],

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, { ...msg, id: genId(), timestamp: Date.now() }],
    })),

  setProcessing: (processing) => set({ isProcessing: processing }),
  setExpanded: (expanded) => set({ isExpanded: expanded }),

  addActiveAgent: (agent) =>
    set((s) => ({
      activeAgents: [...s.activeAgents, { ...agent, status: 'working', costSoFar: 0 }],
    })),

  updateAgent: (id, updates) =>
    set((s) => ({
      activeAgents: s.activeAgents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  removeAgent: (id) =>
    set((s) => ({ activeAgents: s.activeAgents.filter((a) => a.id !== id) })),

  clearMessages: () => set({ messages: [] }),
}))
```

**Step 2: Create Moneypenny system prompt**

```typescript
// packages/editor/src/moneypenny/system-prompt.ts
export const MONEYPENNY_SYSTEM_PROMPT = `You are Moneypenny, an AI website building assistant.

Personality:
- British, female, warm but competent
- Academic Moneypenny — clever, organised, occasionally dry wit
- Never condescending, always explains what you're doing and why
- You address users directly, no third-person narration

Capabilities:
- You can build entire websites from descriptions
- You can write content (blog posts, product descriptions, copy)
- You can suggest layouts, colour palettes, and design improvements
- You can analyse SEO and accessibility
- You can explain costs before taking action
- You manage the user's website projects

Rules:
- ALWAYS estimate cost before executing an expensive AI operation
- Be concise — don't waffle. Short sentences, clear actions.
- When you build something, describe what you're building as you go
- If the user asks something you can't do yet, be honest: "That's coming soon."
- Remember past conversations and preferences when context is provided

Format:
- Keep responses under 3 paragraphs unless the user asks for detail
- Use plain English, no jargon unless the user uses it first
- When listing options, use numbered lists
- When showing costs, always use GBP (£)
`
```

**Step 3: Create agent router**

```typescript
// packages/editor/src/moneypenny/agent-router.ts
import { getProvider } from '../providers'
import type { CompletionResponse, Message } from '../providers/types'
import { useAiStore } from '../store/aiStore'
import { useChatStore } from '../store/chatStore'
import { MONEYPENNY_SYSTEM_PROMPT } from './system-prompt'

export type AgentType = 'content' | 'design' | 'code' | 'seo' | 'general'

function detectAgentType(message: string): AgentType {
  const lower = message.toLowerCase()
  if (/write|blog|post|copy|text|headline|description/i.test(lower)) return 'content'
  if (/colour|color|layout|font|design|style|theme/i.test(lower)) return 'design'
  if (/code|css|html|javascript|script|function/i.test(lower)) return 'code'
  if (/seo|meta|search|rank|keyword|sitemap/i.test(lower)) return 'seo'
  return 'general'
}

export async function routeMessage(userMessage: string): Promise<string> {
  const aiState = useAiStore.getState()
  const chatState = useChatStore.getState()
  const { defaultProvider, defaultModel, apiKeys } = aiState

  const keyConfig = apiKeys.find(k => k.providerId === defaultProvider && k.validated)
  if (!keyConfig) {
    return "I'd love to help, but I need an AI model to work with. Pop into Settings and add an API key — I work with Claude, GPT, Gemini, and Mistral."
  }

  const provider = getProvider(defaultProvider)
  if (!provider) return "Something's gone wrong with the model configuration. Check Settings?"

  const agentType = detectAgentType(userMessage)
  const agentId = Math.random().toString(36).slice(2, 8)

  chatState.addActiveAgent({ id: agentId, type: agentType, model: defaultModel })

  try {
    // Build conversation history
    const history: Message[] = [
      { role: 'system', content: MONEYPENNY_SYSTEM_PROMPT },
      ...chatState.messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ]

    const response = await provider.complete(keyConfig.apiKey, {
      messages: history,
      model: defaultModel,
      maxTokens: 2048,
    })

    // Track cost
    aiState.addCostRecord({
      timestamp: Date.now(),
      providerId: defaultProvider,
      model: defaultModel,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      costGBP: response.costEstimate,
      task: agentType,
    })

    chatState.updateAgent(agentId, { status: 'done', costSoFar: response.costEstimate })
    setTimeout(() => chatState.removeAgent(agentId), 2000)

    return response.content
  } catch (err) {
    chatState.updateAgent(agentId, { status: 'error' })
    setTimeout(() => chatState.removeAgent(agentId), 3000)
    return `Something went wrong there. ${err instanceof Error ? err.message : 'Unknown error'}. Want to try again?`
  }
}
```

**Step 4: Build the Moneypenny chat UI component**

```typescript
// packages/editor/src/components/Moneypenny.tsx
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, ChevronDown, ChevronUp, X, Loader2, Sparkles } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useAiStore } from '../store/aiStore'
import { routeMessage } from '../moneypenny/agent-router'

export default function Moneypenny() {
  const { messages, isProcessing, isExpanded, activeAgents, addMessage, setProcessing, setExpanded } = useChatStore()
  const { getMonthSpend, getConfiguredProvider } = useAiStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Add welcome message on first render
  useEffect(() => {
    if (messages.length === 0) {
      const hasProvider = getConfiguredProvider()
      addMessage({
        role: 'assistant',
        content: hasProvider
          ? "Hello. I'm Moneypenny. What are we building today?"
          : "Hello. I'm Moneypenny. Before we start, you'll need to connect an AI model. Click the ⚙ icon in the toolbar and add an API key — I work with Claude, GPT, Gemini, and Mistral.",
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isProcessing) return

    addMessage({ role: 'user', content: text })
    setInput('')
    setProcessing(true)

    const response = await routeMessage(text)
    addMessage({ role: 'assistant', content: response })
    setProcessing(false)
  }

  const monthSpend = getMonthSpend()

  if (!isExpanded) {
    return (
      <button
        onClick={() => { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 100) }}
        className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover rounded-full shadow-lg shadow-accent/20 text-white text-sm font-medium transition-all z-50"
      >
        <Sparkles size={16} />
        Moneypenny
        {activeAgents.length > 0 && (
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[600px] bg-surface border border-surface-border rounded-xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <span className="text-sm font-medium text-white">Moneypenny</span>
          {monthSpend > 0 && (
            <span className="text-xs text-neutral-500">£{monthSpend.toFixed(4)} this month</span>
          )}
        </div>
        <button onClick={() => setExpanded(false)} className="text-neutral-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <div className="px-4 py-2 border-b border-surface-border bg-surface-dark/50 space-y-1">
          {activeAgents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-2 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'working' ? 'bg-amber-400 animate-pulse' : agent.status === 'done' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-neutral-400">{agent.type} agent</span>
              <span className="text-neutral-600">({agent.model})</span>
              {agent.costSoFar > 0 && <span className="text-neutral-600 ml-auto">£{agent.costSoFar.toFixed(4)}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-surface-dark text-neutral-200 border border-surface-border'
              }`}
            >
              {msg.content}
              {msg.costGBP !== undefined && msg.costGBP > 0 && (
                <div className="text-xs text-neutral-500 mt-1">£{msg.costGBP.toFixed(4)}</div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-surface-dark border border-surface-border rounded-lg px-3 py-2">
              <Loader2 size={14} className="animate-spin text-accent" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-surface-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Moneypenny anything..."
            className="flex-1 px-3 py-2 bg-surface-dark border border-surface-border rounded-lg text-sm text-white placeholder-neutral-600 focus:border-accent focus:outline-none"
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-2 bg-accent rounded-lg text-white disabled:opacity-40 hover:bg-accent-hover transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Add Moneypenny to App.tsx**

Modify `packages/editor/src/App.tsx` — add `<Moneypenny />` component at the bottom of both dashboard and editor views, so she's always present.

```typescript
// Updated App.tsx
import { useState } from 'react'
import type { Editor as GjsEditor } from 'grapesjs'
import { useProjectStore } from './store/projectStore'
import { useAiStore } from './store/aiStore'
import Dashboard from './components/Dashboard'
import Editor from './components/Editor'
import Toolbar from './components/Toolbar'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import Moneypenny from './components/Moneypenny'
import SettingsModal from './components/SettingsModal'

export default function App() {
  const { view } = useProjectStore()
  const { showSettings } = useAiStore()
  const [editor, setEditor] = useState<GjsEditor | null>(null)

  return (
    <>
      {view === 'dashboard' ? (
        <Dashboard />
      ) : (
        <div className="h-screen flex flex-col bg-surface-dark">
          <Toolbar editor={editor} />
          <div className="flex flex-1 min-h-0">
            <LeftPanel />
            <div className="flex-1 min-w-0">
              <Editor onEditorReady={setEditor} />
            </div>
            <RightPanel />
          </div>
        </div>
      )}
      <Moneypenny />
      {showSettings && <SettingsModal />}
    </>
  )
}
```

**Step 6: Commit**

```bash
git add packages/editor/src/components/Moneypenny.tsx packages/editor/src/store/chatStore.ts packages/editor/src/moneypenny/ packages/editor/src/App.tsx
git commit -m "feat: add Moneypenny chat interface with agent routing and cost tracking"
```

---

## Task 4: Moneypenny Memory & Persistence

**Files:**
- Create: `packages/editor/src/moneypenny/memory.ts`
- Modify: `packages/editor/src/utils/db.ts` — add memory + chat tables
- Modify: `packages/editor/src/moneypenny/agent-router.ts` — inject memory into context

**Step 1: Add memory and chat tables to Dexie**

Add `chatHistory`, `aiConfig`, and `memory` tables to the existing Dexie database in `db.ts`.

**Step 2: Create memory manager**

```typescript
// packages/editor/src/moneypenny/memory.ts
import { db } from '../utils/db'

export interface MemoryEntry {
  id?: number
  key: string        // e.g. "brand_voice", "preferred_style", "business_type"
  value: string
  source: string     // which conversation created this
  createdAt: number
  updatedAt: number
}

export async function saveMemory(key: string, value: string, source = 'conversation') {
  const existing = await db.table('memory').where('key').equals(key).first()
  if (existing) {
    await db.table('memory').update(existing.id, { value, updatedAt: Date.now() })
  } else {
    await db.table('memory').add({ key, value, source, createdAt: Date.now(), updatedAt: Date.now() })
  }
}

export async function getMemory(key: string): Promise<string | undefined> {
  const entry = await db.table('memory').where('key').equals(key).first()
  return entry?.value
}

export async function getAllMemories(): Promise<MemoryEntry[]> {
  return db.table('memory').toArray()
}

export async function buildMemoryContext(): Promise<string> {
  const memories = await getAllMemories()
  if (memories.length === 0) return ''
  const lines = memories.map(m => `- ${m.key}: ${m.value}`)
  return `\n\nWhat I remember about this user:\n${lines.join('\n')}`
}
```

**Step 3: Inject memory into agent router**

Update `agent-router.ts` to call `buildMemoryContext()` and append it to the system prompt before sending to the model.

**Step 4: Commit**

```bash
git add packages/editor/src/moneypenny/memory.ts packages/editor/src/utils/db.ts packages/editor/src/moneypenny/agent-router.ts
git commit -m "feat: add Moneypenny persistent memory system"
```

---

## Task 5: Settings Button in Toolbar + AI Persistence

**Files:**
- Modify: `packages/editor/src/components/Toolbar.tsx` — add ⚙ button
- Modify: `packages/editor/src/utils/db.ts` — persist AI config
- Modify: `packages/editor/src/store/aiStore.ts` — load/save to IndexedDB

**Step 1: Add Settings icon to Toolbar, triggering `setShowSettings(true)`**

**Step 2: On app load, hydrate aiStore from IndexedDB. On every change, write back.**

**Step 3: Commit**

```bash
git commit -m "feat: add settings button to toolbar, persist AI config in IndexedDB"
```

---

## Task 6: First-Time Onboarding Flow

**Files:**
- Create: `packages/editor/src/components/Onboarding.tsx`
- Modify: `packages/editor/src/App.tsx` — show onboarding on first visit

**Step 1: Create Onboarding component**

Full-screen dark welcome with Moneypenny's greeting. Three buttons:
- "Show me around" (tour)
- "Let's build" (starts chat-driven site creation)
- "I have a site to import" (upload JSON)

Checks IndexedDB for `onboarding_complete` flag. Only shows once.

**Step 2: Wire into App.tsx — show Onboarding if first visit**

**Step 3: Commit**

```bash
git commit -m "feat: add first-time onboarding with Moneypenny greeting"
```

---

## Task 7: Build, Deploy, Verify

**Step 1: Run typecheck**
```bash
pnpm typecheck
```

**Step 2: Run build**
```bash
pnpm build
```

**Step 3: Deploy to Cloudflare Pages**
```bash
npx wrangler pages deploy packages/editor/dist --project-name nss-local-web-builder
```

**Step 4: Verify on live site**
- Open https://nss-local-web-builder.pages.dev
- See onboarding screen
- Click "Let's build"
- Open Settings, paste an API key
- Chat with Moneypenny
- Verify cost tracking works
- Verify memory persistence (reload, check she remembers)

**Step 5: Commit and push**
```bash
git push origin Doctor
```

---

## Summary

| Task | What it builds | Files |
|------|---------------|-------|
| 1 | BYOK model adapters (Anthropic, OpenAI, Google, Mistral) | 6 new files |
| 2 | AI settings store + Settings modal UI | 2 new, 2 modified |
| 3 | Moneypenny chat UI + agent router | 4 new, 1 modified |
| 4 | Persistent memory system | 1 new, 2 modified |
| 5 | Toolbar settings button + DB persistence | 2 modified |
| 6 | First-time onboarding screen | 1 new, 1 modified |
| 7 | Build, deploy, verify | Commands only |
