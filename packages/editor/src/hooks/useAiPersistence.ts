// ---------------------------------------------------------------------------
// useAiPersistence — hydrate AI config from IndexedDB on mount, persist on change
// ---------------------------------------------------------------------------
import { useEffect, useRef } from 'react'
import { useAiStore } from '../store/aiStore'
import { loadAiConfig, saveAiConfig, loadCostHistory } from '../utils/db'

export function useAiPersistence() {
  const hydrated = useRef(false)

  // Hydrate store from IndexedDB on first mount
  useEffect(() => {
    async function hydrate() {
      try {
        const config = await loadAiConfig()
        if (config) {
          const store = useAiStore.getState()
          const apiKeys = JSON.parse(config.apiKeys || '[]')
          const taskRouting = JSON.parse(config.taskRouting || '{}')

          // Hydrate each field
          for (const key of apiKeys) {
            store.setApiKey(key.providerId, key.apiKey)
            if (key.validated) {
              store.setKeyValidated(key.providerId, true)
            }
          }
          if (config.defaultProvider && config.defaultModel) {
            store.setDefault(config.defaultProvider, config.defaultModel)
          }
          for (const [task, route] of Object.entries(taskRouting)) {
            store.setTaskRoute(task, route as { providerId: string; model: string })
          }
          store.setBudget(config.monthlyBudgetGBP)
        }

        // Load cost history
        const history = await loadCostHistory()
        if (history.length > 0) {
          const store = useAiStore.getState()
          for (const record of history) {
            store.addCostRecord(record)
          }
        }
      } catch {
        // Silently handle first-run where tables may be empty
      }

      hydrated.current = true
    }

    hydrate()
  }, [])

  // Subscribe to store changes and persist to IndexedDB
  useEffect(() => {
    const unsub = useAiStore.subscribe((state) => {
      // Skip writes until initial hydration is complete
      if (!hydrated.current) return

      saveAiConfig({
        apiKeys: JSON.stringify(state.apiKeys),
        defaultProvider: state.defaultProvider,
        defaultModel: state.defaultModel,
        taskRouting: JSON.stringify(state.taskRouting),
        monthlyBudgetGBP: state.monthlyBudgetGBP,
      }).catch(() => {
        // Persist errors are non-fatal
      })
    })

    return unsub
  }, [])
}
