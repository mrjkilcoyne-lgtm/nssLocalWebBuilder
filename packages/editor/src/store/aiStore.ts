// ---------------------------------------------------------------------------
// AI Configuration Store — API keys, model defaults, cost tracking
// ---------------------------------------------------------------------------
import { create } from 'zustand'

export interface StoredApiKey {
  providerId: string
  apiKey: string
  validated: boolean
}

export interface TaskRoute {
  providerId: string
  model: string
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
  apiKeys: StoredApiKey[]
  defaultProvider: string | null
  defaultModel: string | null
  taskRouting: Record<string, TaskRoute>
  monthlyBudgetGBP: number
  costHistory: CostRecord[]
  showSettings: boolean

  // Mutations
  setApiKey: (providerId: string, apiKey: string) => void
  setKeyValidated: (providerId: string, validated: boolean) => void
  removeApiKey: (providerId: string) => void
  setDefault: (providerId: string, model: string) => void
  setTaskRoute: (task: string, route: TaskRoute) => void
  setBudget: (gbp: number) => void
  addCostRecord: (record: CostRecord) => void
  setShowSettings: (show: boolean) => void

  // Computed
  getMonthSpend: () => number
  getConfiguredProvider: () => { providerId: string; model: string } | null
}

export const useAiStore = create<AiState>((set, get) => ({
  apiKeys: [],
  defaultProvider: null,
  defaultModel: null,
  taskRouting: {},
  monthlyBudgetGBP: 10,
  costHistory: [],
  showSettings: false,

  setApiKey: (providerId, apiKey) =>
    set((s) => {
      const exists = s.apiKeys.find((k) => k.providerId === providerId)
      if (exists) {
        return {
          apiKeys: s.apiKeys.map((k) =>
            k.providerId === providerId ? { ...k, apiKey, validated: false } : k,
          ),
        }
      }
      return { apiKeys: [...s.apiKeys, { providerId, apiKey, validated: false }] }
    }),

  setKeyValidated: (providerId, validated) =>
    set((s) => ({
      apiKeys: s.apiKeys.map((k) =>
        k.providerId === providerId ? { ...k, validated } : k,
      ),
    })),

  removeApiKey: (providerId) =>
    set((s) => ({
      apiKeys: s.apiKeys.filter((k) => k.providerId !== providerId),
      defaultProvider:
        s.defaultProvider === providerId ? null : s.defaultProvider,
      defaultModel:
        s.defaultProvider === providerId ? null : s.defaultModel,
    })),

  setDefault: (providerId, model) =>
    set({ defaultProvider: providerId, defaultModel: model }),

  setTaskRoute: (task, route) =>
    set((s) => ({
      taskRouting: { ...s.taskRouting, [task]: route },
    })),

  setBudget: (gbp) => set({ monthlyBudgetGBP: gbp }),

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

  getConfiguredProvider: () => {
    const { defaultProvider, defaultModel, apiKeys } = get()
    if (!defaultProvider || !defaultModel) return null
    const key = apiKeys.find(
      (k) => k.providerId === defaultProvider && k.validated,
    )
    if (!key) return null
    return { providerId: defaultProvider, model: defaultModel }
  },
}))
