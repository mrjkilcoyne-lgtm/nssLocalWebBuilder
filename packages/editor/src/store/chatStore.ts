// ---------------------------------------------------------------------------
// Chat Store — message history, processing state, active agents
// ---------------------------------------------------------------------------
import { create } from 'zustand'

export type AgentType = 'content' | 'design' | 'code' | 'seo' | 'general'
export type AgentStatus = 'working' | 'done' | 'error'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  costGBP?: number
  model?: string
  agentType?: AgentType
}

export interface ActiveAgent {
  id: string
  type: AgentType
  status: AgentStatus
  model: string
  costSoFar: number
}

interface ChatState {
  messages: ChatMessage[]
  isProcessing: boolean
  isExpanded: boolean
  activeAgents: ActiveAgent[]

  addMessage: (msg: ChatMessage) => void
  setProcessing: (v: boolean) => void
  setExpanded: (v: boolean) => void
  addActiveAgent: (agent: ActiveAgent) => void
  updateAgent: (id: string, updates: Partial<ActiveAgent>) => void
  removeAgent: (id: string) => void
}

const genId = () => Math.random().toString(36).substring(2, 10)

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isProcessing: false,
  isExpanded: false,
  activeAgents: [],

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, { ...msg, id: msg.id || genId() }] })),

  setProcessing: (v) => set({ isProcessing: v }),
  setExpanded: (v) => set({ isExpanded: v }),

  addActiveAgent: (agent) =>
    set((s) => ({ activeAgents: [...s.activeAgents, agent] })),

  updateAgent: (id, updates) =>
    set((s) => ({
      activeAgents: s.activeAgents.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    })),

  removeAgent: (id) =>
    set((s) => ({
      activeAgents: s.activeAgents.filter((a) => a.id !== id),
    })),
}))
