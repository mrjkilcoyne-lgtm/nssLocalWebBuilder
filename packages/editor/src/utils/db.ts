import Dexie, { type EntityTable } from 'dexie'

// ---------------------------------------------------------------------------
// Project records
// ---------------------------------------------------------------------------
interface ProjectRecord {
  id: string
  name: string
  domain: string
  status: string
  createdAt: Date
  updatedAt: Date
  editorData: string | null
  pages: string // JSON serialized
}

// ---------------------------------------------------------------------------
// AI Configuration — single-row table
// ---------------------------------------------------------------------------
export interface AiConfigRecord {
  id: string // always "singleton"
  apiKeys: string // JSON: StoredApiKey[]
  defaultProvider: string | null
  defaultModel: string | null
  taskRouting: string // JSON: Record<string, TaskRoute>
  monthlyBudgetGBP: number
}

// ---------------------------------------------------------------------------
// Cost history — timestamped spend records
// ---------------------------------------------------------------------------
export interface CostHistoryRecord {
  id?: number // auto-increment
  timestamp: number
  providerId: string
  model: string
  inputTokens: number
  outputTokens: number
  costGBP: number
  task: string
}

// ---------------------------------------------------------------------------
// Database definition
// ---------------------------------------------------------------------------
const db = new Dexie('nssLocalWebBuilder') as Dexie & {
  projects: EntityTable<ProjectRecord, 'id'>
  aiConfig: EntityTable<AiConfigRecord, 'id'>
  costHistory: EntityTable<CostHistoryRecord, 'id'>
}

db.version(1).stores({
  projects: 'id, name, domain, status, updatedAt',
})

db.version(2).stores({
  projects: 'id, name, domain, status, updatedAt',
  aiConfig: 'id',
  costHistory: '++id, timestamp, providerId',
})

// ---------------------------------------------------------------------------
// Project helpers (unchanged)
// ---------------------------------------------------------------------------
export async function saveProject(project: {
  id: string
  name: string
  domain: string
  status: string
  createdAt: Date
  updatedAt: Date
  editorData: string | null
  pages: { id: string; name: string; slug: string; isHome: boolean }[]
}) {
  await db.projects.put({
    ...project,
    pages: JSON.stringify(project.pages),
  })
}

export async function loadProjects() {
  const records = await db.projects.toArray()
  return records.map((r) => ({
    ...r,
    pages: JSON.parse(r.pages),
  }))
}

export async function deleteProject(id: string) {
  await db.projects.delete(id)
}

// ---------------------------------------------------------------------------
// AI Config helpers
// ---------------------------------------------------------------------------
export async function saveAiConfig(config: Omit<AiConfigRecord, 'id'>) {
  await db.aiConfig.put({ id: 'singleton', ...config })
}

export async function loadAiConfig(): Promise<AiConfigRecord | undefined> {
  return db.aiConfig.get('singleton')
}

// ---------------------------------------------------------------------------
// Cost history helpers
// ---------------------------------------------------------------------------
export async function addCostHistoryRecord(record: Omit<CostHistoryRecord, 'id'>) {
  await db.costHistory.add(record)
}

export async function loadCostHistory(): Promise<CostHistoryRecord[]> {
  return db.costHistory.toArray()
}

export { db }
