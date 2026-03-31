import Dexie, { type EntityTable } from 'dexie'

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

const db = new Dexie('nssLocalWebBuilder') as Dexie & {
  projects: EntityTable<ProjectRecord, 'id'>
}

db.version(1).stores({
  projects: 'id, name, domain, status, updatedAt',
})

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

export { db }
