// ---------------------------------------------------------------------------
// Moneypenny Memory — persistent preferences and learned context
// ---------------------------------------------------------------------------
import { db } from '../utils/db'

export interface MemoryEntry {
  id?: number
  key: string        // e.g. "brand_voice", "preferred_style", "business_type"
  value: string
  source: string     // which conversation created this
  createdAt: number
  updatedAt: number
}

/**
 * Upsert a memory entry. If a key already exists, its value is updated.
 */
export async function saveMemory(
  key: string,
  value: string,
  source = 'conversation',
): Promise<void> {
  const existing = await db.memory.where('key').equals(key).first()
  const now = Date.now()

  if (existing) {
    await db.memory.update(existing.id!, {
      value,
      source,
      updatedAt: now,
    })
  } else {
    await db.memory.add({
      key,
      value,
      source,
      createdAt: now,
      updatedAt: now,
    })
  }
}

/**
 * Retrieve a single memory value by key. Returns undefined if not found.
 */
export async function getMemory(key: string): Promise<string | undefined> {
  const entry = await db.memory.where('key').equals(key).first()
  return entry?.value
}

/**
 * List every memory entry.
 */
export async function getAllMemories(): Promise<MemoryEntry[]> {
  return db.memory.toArray()
}

/**
 * Remove a memory entry by key.
 */
export async function deleteMemory(key: string): Promise<void> {
  await db.memory.where('key').equals(key).delete()
}

/**
 * Build a formatted context block from all stored memories, suitable for
 * injection into the system prompt so Moneypenny recalls user preferences.
 */
export async function buildMemoryContext(): Promise<string> {
  const memories = await getAllMemories()
  if (memories.length === 0) return ''

  const lines = memories.map(
    (m) => `- ${m.key}: ${m.value}`,
  )

  return [
    '',
    'User context (remembered from previous conversations):',
    ...lines,
  ].join('\n')
}
