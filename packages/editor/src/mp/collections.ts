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
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
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

export async function getItem(id: number): Promise<CollectionItem | undefined> {
  const record = await (db as any).collectionItems.get(id)
  if (!record) return undefined
  return { ...record, data: JSON.parse(record.data) }
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

// --- Utility ---

export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  const record = await (db as any).collections.where('slug').equals(slug).first()
  if (!record) return undefined
  return { ...record, schema: JSON.parse(record.schema) }
}

export async function getItemCount(collectionId: number): Promise<number> {
  return await (db as any).collectionItems
    .where('collectionId')
    .equals(collectionId)
    .count()
}
