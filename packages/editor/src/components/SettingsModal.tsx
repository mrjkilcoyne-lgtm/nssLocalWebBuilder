// ---------------------------------------------------------------------------
// Settings Modal — BYOK API key management, budget, default model
// ---------------------------------------------------------------------------
import { useEffect, useCallback, useState } from 'react'
import { X, Check, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { useAiStore, type StoredApiKey } from '../store/aiStore'
import { getAllProviders, getProvider } from '../providers'
import { getAllMemories, deleteMemory, type MemoryEntry } from '../mp/memory'

export default function SettingsModal() {
  const {
    apiKeys,
    defaultProvider,
    defaultModel,
    monthlyBudgetGBP,
    showSettings,
    voiceEnabled,
    setApiKey,
    setKeyValidated,
    removeApiKey,
    setDefault,
    setBudget,
    setShowSettings,
    setVoiceEnabled,
    getMonthSpend,
  } = useAiStore()

  const [validating, setValidating] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [memories, setMemories] = useState<MemoryEntry[]>([])

  useEffect(() => {
    if (showSettings) {
      getAllMemories().then(setMemories)
    }
  }, [showSettings])

  const handleDeleteMemory = async (key: string) => {
    await deleteMemory(key)
    setMemories(prev => prev.filter(m => m.key !== key))
  }

  const providers = getAllProviders()
  const monthSpend = getMonthSpend()

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSettings(false)
    },
    [setShowSettings],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!showSettings) return null

  const getDraft = (pid: string) =>
    drafts[pid] ?? apiKeys.find((k) => k.providerId === pid)?.apiKey ?? ''

  const setDraft = (pid: string, v: string) =>
    setDrafts((d) => ({ ...d, [pid]: v }))

  const handleValidate = async (pid: string) => {
    const key = getDraft(pid).trim()
    if (!key) return
    setApiKey(pid, key)
    setValidating(pid)
    try {
      const provider = getProvider(pid)
      const ok = provider ? await provider.validateKey(key) : false
      setKeyValidated(pid, ok)
      if (ok && !defaultProvider) {
        const p = getProvider(pid)
        if (p && p.models.length > 0) {
          setDefault(pid, p.models[0].id)
        }
      }
    } catch {
      setKeyValidated(pid, false)
    } finally {
      setValidating(null)
    }
  }

  const keyStatus = (pid: string): StoredApiKey | undefined =>
    apiKeys.find((k) => k.providerId === pid)

  // Build list of validated models for default selector
  const validatedModels: { providerId: string; modelId: string; label: string }[] = []
  for (const p of providers) {
    const k = apiKeys.find((ak) => ak.providerId === p.id && ak.validated)
    if (k) {
      for (const m of p.models) {
        validatedModels.push({
          providerId: p.id,
          modelId: m.id,
          label: `${p.name} / ${m.name}`,
        })
      }
    }
  }

  const handleDefaultChange = (value: string) => {
    const entry = validatedModels.find(
      (v) => `${v.providerId}::${v.modelId}` === value,
    )
    if (entry) setDefault(entry.providerId, entry.modelId)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={() => setShowSettings(false)}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-mp-border bg-mp-surface shadow-2xl animate-mp-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mp-border px-6 py-4">
          <h2 className="font-mp-serif text-lg text-mp-text">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="rounded p-1 text-mp-muted transition-colors hover:text-mp-text"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-8">
          {/* Budget */}
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-mp-muted">
              Monthly Budget
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-mp-muted">&pound;</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={monthlyBudgetGBP}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                  className="w-24 rounded border border-mp-border bg-mp-bg px-3 py-1.5 text-sm text-mp-text focus:border-mp-gold focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-mp-muted">This month:</span>
                <span className="font-mp-mono text-xs text-mp-gold">
                  &pound;{monthSpend.toFixed(4)}
                </span>
              </div>
            </div>
          </section>

          {/* Voice */}
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-mp-muted">
              Voice
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="rounded border-mp-border accent-mp-gold"
              />
              <span className="text-sm text-mp-text">Enable voice input and output</span>
            </label>
          </section>

          {/* API Keys */}
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-mp-muted">
              API Keys
            </h3>
            <div className="space-y-4">
              {providers.map((p) => {
                const ks = keyStatus(p.id)
                const isValidating = validating === p.id
                return (
                  <div
                    key={p.id}
                    className="rounded border border-mp-border bg-mp-bg p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-mp-text">
                        {p.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {ks?.validated === true && (
                          <span className="flex items-center gap-1 text-xs text-mp-emerald">
                            <Check size={12} /> Valid
                          </span>
                        )}
                        {ks && ks.validated === false && ks.apiKey && (
                          <span className="flex items-center gap-1 text-xs text-mp-red">
                            <AlertCircle size={12} /> Invalid
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder={`Paste ${p.name} API key`}
                        value={getDraft(p.id)}
                        onChange={(e) => setDraft(p.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleValidate(p.id)}
                        className="flex-1 rounded border border-mp-border bg-mp-surface px-3 py-1.5 text-sm text-mp-text placeholder-neutral-600 focus:border-mp-gold focus:outline-none"
                      />
                      <button
                        onClick={() => handleValidate(p.id)}
                        disabled={isValidating || !getDraft(p.id).trim()}
                        className="rounded bg-mp-gold/10 px-3 py-1.5 text-xs font-medium text-mp-gold transition-colors hover:bg-mp-gold/20 disabled:opacity-40"
                      >
                        {isValidating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          'Validate'
                        )}
                      </button>
                      {ks && (
                        <button
                          onClick={() => {
                            removeApiKey(p.id)
                            setDrafts((d) => {
                              const next = { ...d }
                              delete next[p.id]
                              return next
                            })
                          }}
                          className="rounded p-1.5 text-mp-muted transition-colors hover:text-mp-red"
                          title="Remove key"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Default Model */}
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-mp-muted">
              Default Model
            </h3>
            {validatedModels.length === 0 ? (
              <p className="text-xs text-mp-muted">
                Validate at least one API key to select a default model.
              </p>
            ) : (
              <select
                value={
                  defaultProvider && defaultModel
                    ? `${defaultProvider}::${defaultModel}`
                    : ''
                }
                onChange={(e) => handleDefaultChange(e.target.value)}
                className="w-full rounded border border-mp-border bg-mp-bg px-3 py-2 text-sm text-mp-text focus:border-mp-gold focus:outline-none"
              >
                <option value="" disabled>
                  Select default model
                </option>
                {validatedModels.map((v) => (
                  <option
                    key={`${v.providerId}::${v.modelId}`}
                    value={`${v.providerId}::${v.modelId}`}
                  >
                    {v.label}
                  </option>
                ))}
              </select>
            )}
          </section>
          {/* MP Remembers */}
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-mp-muted">
              MP Remembers
            </h3>
            {memories.length === 0 ? (
              <p className="text-xs text-mp-muted">
                No memories stored yet. MP will learn your preferences as you work together.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {memories.map((m) => (
                  <div key={m.key} className="flex items-start justify-between gap-2 rounded border border-mp-border bg-mp-bg p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-mp-text truncate">{m.key}</span>
                        <span className="shrink-0 rounded bg-mp-gold/10 px-1.5 py-0.5 text-[9px] font-medium text-mp-gold uppercase">
                          {m.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-mp-muted truncate">{m.value}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(m.key)}
                      className="shrink-0 rounded p-1 text-mp-muted transition-colors hover:text-mp-red"
                      title="Forget this"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-mp-border px-6 py-4">
          <button
            onClick={() => setShowSettings(false)}
            className="rounded bg-mp-gold px-4 py-2 text-sm font-medium text-mp-bg transition-colors hover:bg-mp-gold-hover"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
