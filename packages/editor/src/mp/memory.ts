// ---------------------------------------------------------------------------
// Moneypenny Memory — tiered storage with categories, decay, and promotion
// ---------------------------------------------------------------------------
import { db } from '../utils/db'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type MemoryCategory =
  | 'brand'
  | 'workflow'
  | 'preference'
  | 'skill'
  | 'cost_pattern'
  | 'episodic'

export type MemoryTier = 'working' | 'short' | 'long'

export interface MemoryEntry {
  id?: number
  key: string
  value: string
  source: string
  category: MemoryCategory
  importance: number      // 0–1
  decayRate: number        // 0–1, higher = decays faster
  tier: MemoryTier
  accessCount: number
  expiresAt: number | null // epoch ms, null = never
  createdAt: number
  updatedAt: number
}

// ---------------------------------------------------------------------------
// Agent → category mapping
// ---------------------------------------------------------------------------
export const AGENT_CATEGORY_MAP: Record<string, MemoryCategory[]> = {
  brand:     ['brand', 'preference'],
  design:    ['brand', 'preference', 'workflow'],
  copy:      ['brand', 'preference', 'skill'],
  cost:      ['cost_pattern', 'workflow'],
  architect: ['workflow', 'skill'],
  default:   ['brand', 'workflow', 'preference', 'skill', 'cost_pattern', 'episodic'],
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SHORT_TERM_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const PROMOTION_THRESHOLD = 3                       // accesses before short→long

// ---------------------------------------------------------------------------
// saveMemory — upsert with category / importance / tier support
// ---------------------------------------------------------------------------
export async function saveMemory(
  key: string,
  value: string,
  options: {
    source?: string
    category?: MemoryCategory
    importance?: number
    tier?: MemoryTier
    decayRate?: number
  } = {},
): Promise<void> {
  const now = Date.now()
  const source     = options.source ?? 'conversation'
  const category   = options.category ?? 'preference'
  const importance = options.importance ?? 0.5
  const tier       = options.tier ?? 'short'
  const decayRate  = options.decayRate ?? 0.1

  const expiresAt  = tier === 'short' ? now + SHORT_TERM_TTL_MS : null

  const existing = await db.memory.where('key').equals(key).first()

  if (existing) {
    await db.memory.update(existing.id!, {
      value,
      source,
      category,
      importance,
      tier,
      decayRate,
      expiresAt,
      updatedAt: now,
    })
  } else {
    await db.memory.add({
      key,
      value,
      source,
      category,
      importance,
      decayRate,
      tier,
      accessCount: 0,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    })
  }
}

// ---------------------------------------------------------------------------
// getMemory — retrieve and auto-promote
// ---------------------------------------------------------------------------
export async function getMemory(key: string): Promise<string | undefined> {
  const entry = await db.memory.where('key').equals(key).first()
  if (!entry) return undefined

  const newCount = (entry.accessCount ?? 0) + 1
  const updates: Record<string, unknown> = { accessCount: newCount }

  // Auto-promote short → long after threshold
  if (entry.tier === 'short' && newCount >= PROMOTION_THRESHOLD) {
    updates.tier = 'long'
    updates.expiresAt = null
  }

  await db.memory.update(entry.id!, updates)
  return entry.value
}

// ---------------------------------------------------------------------------
// getAllMemories — with optional filters, excludes expired
// ---------------------------------------------------------------------------
export async function getAllMemories(
  filters?: { category?: MemoryCategory; tier?: MemoryTier },
): Promise<MemoryEntry[]> {
  const now = Date.now()
  let collection = db.memory.toCollection()

  if (filters?.category) {
    collection = db.memory.where('category').equals(filters.category)
  }

  let results = await collection.toArray()

  // Filter expired
  results = results.filter(
    (m) => m.expiresAt === null || m.expiresAt === undefined || m.expiresAt > now,
  )

  // Filter by tier if specified (and we didn't already filter by category)
  if (filters?.tier) {
    results = results.filter((m) => m.tier === filters.tier)
  }

  // If we filtered by category via index but also need tier
  if (filters?.category && filters?.tier) {
    results = results.filter((m) => m.tier === filters.tier)
  }

  return results as MemoryEntry[]
}

// ---------------------------------------------------------------------------
// deleteMemory
// ---------------------------------------------------------------------------
export async function deleteMemory(key: string): Promise<void> {
  await db.memory.where('key').equals(key).delete()
}

// ---------------------------------------------------------------------------
// pruneExpiredMemories — cleanup, returns count deleted
// ---------------------------------------------------------------------------
export async function pruneExpiredMemories(): Promise<number> {
  const now = Date.now()
  const expired = await db.memory
    .filter((m) => m.expiresAt !== null && m.expiresAt !== undefined && m.expiresAt <= now)
    .toArray()

  const ids = expired.map((m) => m.id!).filter(Boolean)
  if (ids.length > 0) {
    await db.memory.bulkDelete(ids)
  }
  return ids.length
}

// ---------------------------------------------------------------------------
// scoreRelevance — keyword-bag overlap * importance * recency
// ---------------------------------------------------------------------------
export function scoreRelevance(
  memory: MemoryEntry,
  query: string,
): number {
  const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  const memoryText  = `${memory.key} ${memory.value}`.toLowerCase()
  const memoryTokens = memoryText.split(/\s+/).filter(Boolean)

  if (queryTokens.length === 0) return 0

  // Keyword overlap
  const matchCount = queryTokens.filter((t) => memoryTokens.includes(t)).length
  const overlap = matchCount / queryTokens.length

  // Importance weight
  const importance = memory.importance ?? 0.5

  // Recency: exponential decay based on age in days
  const ageMs = Date.now() - (memory.updatedAt ?? memory.createdAt)
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  const decay = memory.decayRate ?? 0.1
  const recency = Math.exp(-decay * ageDays)

  return overlap * importance * recency
}

// ---------------------------------------------------------------------------
// buildMemoryContext — agent-aware, relevance-scored, budget-constrained
// ---------------------------------------------------------------------------
export async function buildMemoryContext(
  agentType: string,
  query: string,
  tokenBudget = 500,
): Promise<string> {
  const categories = AGENT_CATEGORY_MAP[agentType] ?? AGENT_CATEGORY_MAP.default
  const charBudget = tokenBudget * 4

  // Fetch all non-expired memories in relevant categories
  const allMemories: MemoryEntry[] = []
  for (const cat of categories) {
    const mems = await getAllMemories({ category: cat })
    allMemories.push(...mems)
  }

  // Deduplicate by id
  const seen = new Set<number>()
  const unique = allMemories.filter((m) => {
    if (m.id === undefined || seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })

  if (unique.length === 0) return ''

  // Score and sort
  const scored = unique
    .map((m) => ({ memory: m, score: scoreRelevance(m, query) }))
    .sort((a, b) => b.score - a.score)

  // Build output within budget
  const lines: string[] = []
  let totalChars = 0

  for (const { memory } of scored) {
    const line = `- ${memory.key}: ${memory.value}`
    if (totalChars + line.length > charBudget) break
    lines.push(line)
    totalChars += line.length
  }

  if (lines.length === 0) return ''

  return [
    '',
    'User context (remembered from previous conversations):',
    ...lines,
  ].join('\n')
}
