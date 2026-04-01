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

  if (!db.tables.some(t => t.name === 'responseCache')) return undefined

  const entry = await (db as any).responseCache.where('hash').equals(hash).first()
  if (!entry) return undefined

  if (Date.now() - entry.createdAt > CACHE_TTL) {
    await (db as any).responseCache.delete(entry.id)
    return undefined
  }

  return entry
}

export async function setCachedResponse(
  systemPrompt: string,
  lastMessage: string,
  response: Omit<CacheEntry, 'id' | 'hash' | 'createdAt'>,
): Promise<void> {
  const hash = await hashString(systemPrompt + '|' + lastMessage)

  if (!db.tables.some(t => t.name === 'responseCache')) return

  await (db as any).responseCache.put({
    ...response,
    hash,
    createdAt: Date.now(),
  })
}
