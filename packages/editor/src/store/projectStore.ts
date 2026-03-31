import { create } from 'zustand'

export interface Project {
  id: string
  name: string
  domain: string
  status: 'draft' | 'live' | 'deploying'
  createdAt: Date
  updatedAt: Date
  editorData: string | null // GrapesJS JSON
  pages: PageMeta[]
}

export interface PageMeta {
  id: string
  name: string
  slug: string
  isHome: boolean
}

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  view: 'dashboard' | 'editor'

  setView: (view: 'dashboard' | 'editor') => void
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  createProject: (name: string, domain?: string) => Project
}

const generateId = () => Math.random().toString(36).substring(2, 10)

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  projects: [],
  view: 'dashboard',

  setView: (view) => set({ view }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setProjects: (projects) => set({ projects }),

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates, updatedAt: new Date() }
          : state.currentProject,
    }))
  },

  createProject: (name, domain = '') => {
    const project: Project = {
      id: generateId(),
      name,
      domain,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      editorData: null,
      pages: [{ id: generateId(), name: 'Home', slug: '/', isHome: true }],
    }
    set((state) => ({ projects: [...state.projects, project] }))
    return project
  },
}))
