# MP Platform Design

**Date:** 2026-04-01
**Status:** Approved
**Branch:** Doctor

---

## 1. Identity

Moneypenny is now **MP**. Internal alias **PM**. British, female, academic warmth with dry wit. Proper English spelling. No emojis. Uses GBP. Opening line: "Hello. I'm MP. What are we building today?"

MP is the platform. The visual editor is her hands. The agent swarm is her brain. The memory system is her experience.

---

## 2. Phase 0: Rebrand

Rename all `moneypenny`/`Moneypenny` references to `mp`/`MP`.

**File changes:**
- `moneypenny/` directory → `mp/` (system-prompt.ts, memory.ts, agent-router.ts)
- `components/Moneypenny.tsx` → `components/MP.tsx`
- All imports across App.tsx, store files, UI components
- System prompt text identity update
- CSS class references where applicable
- PM easter egg in system prompt

Pure rename. No functional changes.

---

## 3. Phase 1: Memory System

### Current
Flat key-value Dexie store. No categories, decay, or importance.

### Upgrade

```typescript
interface MemoryEntry {
  id?: number
  key: string
  value: string
  source: string
  category: 'brand' | 'workflow' | 'preference' | 'skill' | 'cost_pattern' | 'episodic'
  importance: number        // 0-1, default 0.5
  decayRate: number         // 0-1, higher = faster decay
  tier: 'working' | 'short' | 'long'
  accessCount: number
  expiresAt: number | null  // null = permanent
  createdAt: number
  updatedAt: number
}
```

**Tiered retrieval:** `buildMemoryContext(agentType, query, tokenBudget)` filters by category relevance to agent type, scores by importance * recency * accessCount, truncates to token budget (default 500 tokens).

**Similarity:** Keyword-bag cosine similarity. No vector DB needed at this scale.

**Promotion:** Memories accessed 3+ times in 7 days auto-promote short → long. Short-term expires after 7 days unless promoted.

**UI:** "MP remembers" panel in settings. Grouped by category. Edit/delete.

**No Dolt yet** — episodic category is hook point for Phase 5.

---

## 4. Phase 2: Provider Hardening

### Streaming
New `stream` method on `ModelProvider` returning `AsyncIterable<string>`. Each adapter uses native SSE. Chat UI renders token-by-token.

### Retry
3 attempts, exponential backoff (1s, 2s, 4s). Only on 429/500/503. No retry on auth errors.

### Fallback Chains
```typescript
interface FallbackChain {
  primary: { providerId: string; model: string }
  secondary?: { providerId: string; model: string }
  free?: boolean
}
```

### Response Caching
Content-hash system prompt + last message. IndexedDB with 1-hour TTL. Non-streaming only.

### Tiered Model Routing
Wire up existing unused `taskRouting` in aiStore. Default mapping:
- SEO/content → cheap (Haiku/Flash)
- design/code → medium (Sonnet/GPT-4o)
- complex reasoning → expensive (Opus)

### CLIProxyAPI Adapter
New provider hitting localhost proxy endpoints. Zero cost. Graceful fallback when unavailable.

---

## 5. Phase 3: Agent Swarm

### Agent Skill Registry
```typescript
interface AgentSkill {
  id: string
  name: string
  capabilities: string[]
  triggers: { regex: RegExp[]; keywords: string[] }
  dependencies: string[]
  costTier: 'cheap' | 'medium' | 'expensive'
  preferredModels: string[]
  systemPromptExtension: string
}
```

**Eight agents:** content, design, code, seo, deploy, commerce, research, analytics.

### Intent Classification
Regex fast path (80% of messages). Cheapest available model for ambiguous cases (~100 tokens per classification).

### DAG Dispatch
Compound requests decompose into dependency graph. Parallel via `Promise.allSettled()`. Failed agents don't block others.

### Orchestration Feed
Collapsible sidebar showing real-time agent activity. Bloomberg terminal aesthetic. Status dot, agent name, model, tokens, cost in pence.

### Cost Estimation
Before multi-agent ops: "This will use roughly X tokens across Y agents — about Zp. Shall I proceed?"

---

## 6. Phase 4: Voice Pipeline

### STT
Browser Web Speech API (zero cost). Interface abstracted for future Whisper swap.

### TTS
Web Speech API with `en-GB` voice. Interface abstracted for future VibeVoice swap.

### Integration
Voice toggle in settings. Microphone button next to text input. Transcribed text enters `routeMessage()`. Response displayed AND spoken. Always optional.

---

## 7. Phase 5: Collections/CMS

### Storage
IndexedDB via Dexie. Schema designed for future Dolt migration.

```typescript
interface Collection {
  id: string
  name: string
  slug: string
  schema: CollectionField[]
  createdAt: number
  updatedAt: number
}

interface CollectionField {
  name: string
  type: 'text' | 'richtext' | 'number' | 'boolean' | 'date' | 'image' | 'reference'
  required: boolean
  referenceCollection?: string
}

interface CollectionItem {
  id: string
  collectionId: string
  data: Record<string, unknown>
  version: number
  createdAt: number
  updatedAt: number
}
```

### Features
- MP creates collections via chat
- Visual schema editor (simple table UI)
- Dynamic page templates binding to collection data via GrapesJS blocks
- Version history per item (increment on save, query by timestamp)

---

## 8. Phase 6: REFERRED Integration

### Catalog as Knowledge Base
Existing Supabase catalog (201 products, 11 categories) queryable by MP. Cached locally in IndexedDB.

### Agentic Interviewer Pattern
REFERRED's Advisor flow (intent → budget → region → experience → stack) becomes reusable MP capability via commerce agent.

### Transparency
MP always discloses affiliate links. User opts in/out per-site.

---

## 9. Phases 7-8: Deferred

Phase 7 (Civo deployment) and Phase 8 (Gayieties) build on Phases 0-6. Architecture designed to receive them. Out of scope for this implementation pass unless time permits.

---

## 10. Execution Strategy

**Block 1 (parallel, no dependencies):** Phases 0, 1, 2
**Block 2 (parallel, depends on Block 1):** Phases 3, 5, 6
**Block 3 (depends on Block 2):** Phases 4, 7, 8

Within each block, phases execute as parallel agents in isolated worktrees where possible, merging after completion.
