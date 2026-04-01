// ---------------------------------------------------------------------------
// Moneypenny — the AI concierge chat interface
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { useChatStore, type ChatMessage, type ActiveAgent } from '../store/chatStore'
import { useAiStore } from '../store/aiStore'
import { routeMessage } from '../moneypenny/agent-router'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Status dot with semantic colour */
function StatusDot({ status }: { status: 'working' | 'done' | 'error' }) {
  const colour =
    status === 'working'
      ? 'bg-mp-amber'
      : status === 'done'
        ? 'bg-mp-emerald'
        : 'bg-mp-red'
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${colour} ${
        status === 'working' ? 'animate-mp-pulse-dot' : ''
      }`}
    />
  )
}

/** Compact Bloomberg-style agent activity row */
function AgentRow({ agent }: { agent: ActiveAgent }) {
  return (
    <div className="flex items-center gap-2 py-0.5 font-mp-mono text-[10px] text-mp-muted">
      <StatusDot status={agent.status} />
      <span className="uppercase tracking-wide">{agent.type}</span>
      <span className="text-mp-border">|</span>
      <span className="text-mp-muted">{agent.model}</span>
      {agent.costSoFar > 0 && (
        <>
          <span className="text-mp-border">|</span>
          <span className="text-mp-gold">&pound;{agent.costSoFar.toFixed(4)}</span>
        </>
      )}
    </div>
  )
}

/** Typing indicator */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-mp-gold animate-mp-typing"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}

/** Single chat message */
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div
      className={`animate-mp-fade-in ${isUser ? 'flex justify-end' : 'flex justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
          isUser
            ? 'bg-mp-surface text-mp-text text-sm'
            : 'border-l-2 border-mp-gold/40 bg-transparent text-mp-text'
        }`}
      >
        <p
          className={`whitespace-pre-wrap text-sm leading-relaxed ${
            isUser ? 'font-sans' : 'font-mp-body'
          }`}
        >
          {msg.content}
        </p>
        {!isUser && msg.costGBP != null && (
          <p className="mt-1.5 font-mp-mono text-[10px] text-mp-muted">
            &pound;{msg.costGBP.toFixed(4)}
            {msg.model && <span className="ml-2">{msg.model}</span>}
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Moneypenny() {
  const { messages, isProcessing, isExpanded, activeAgents, addMessage, setProcessing, setExpanded } =
    useChatStore()
  const { getMonthSpend, setShowSettings, getConfiguredProvider } = useAiStore()

  const [input, setInput] = useState('')
  const [showAgents, setShowAgents] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isProcessing])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isProcessing) return
    setInput('')

    // Add user message
    addMessage({
      id: Math.random().toString(36).substring(2, 10),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    })

    setProcessing(true)
    try {
      await routeMessage(text)
    } finally {
      setProcessing(false)
    }
  }

  const hasProvider = !!getConfiguredProvider()
  const monthSpend = getMonthSpend()

  // ----- Collapsed state -----
  if (!isExpanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-lg border border-mp-border bg-mp-surface px-4 py-2.5 shadow-lg transition-all duration-200 ease-out hover:border-mp-gold/50 hover:shadow-mp-gold/5"
      >
        <span className="font-mp-serif text-sm text-mp-gold">M</span>
        <span className="text-xs text-mp-muted">Moneypenny</span>
        {activeAgents.length > 0 && (
          <StatusDot status="working" />
        )}
      </button>
    )
  }

  // ----- Expanded state -----
  return (
    <div className="fixed bottom-6 right-6 z-40 flex w-[380px] flex-col rounded-lg border border-mp-border bg-mp-bg shadow-2xl animate-mp-fade-in"
         style={{ maxHeight: 'calc(100vh - 48px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-mp-border px-4 py-3">
        <div className="flex items-center gap-3">
          <h2 className="font-mp-serif text-base text-mp-gold">Moneypenny</h2>
          <span className="font-mp-mono text-[10px] text-mp-muted">
            &pound;{monthSpend.toFixed(2)} this month
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(true)}
            className="rounded p-1 text-mp-muted transition-colors hover:text-mp-gold"
            title="Settings"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={() => setExpanded(false)}
            className="rounded px-2 py-0.5 text-xs text-mp-muted transition-colors hover:text-mp-text"
          >
            Minimise
          </button>
        </div>
      </div>

      {/* Agent activity feed */}
      {activeAgents.length > 0 && (
        <div className="border-b border-mp-border px-4 py-1.5">
          <button
            onClick={() => setShowAgents(!showAgents)}
            className="mb-0.5 font-mp-mono text-[9px] uppercase tracking-widest text-mp-muted hover:text-mp-text"
          >
            {showAgents ? 'Agents' : 'Agents (' + activeAgents.length + ')'}
          </button>
          {showAgents &&
            activeAgents.map((a) => <AgentRow key={a.id} agent={a} />)}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ minHeight: 200, maxHeight: 400 }}>
        {messages.length === 0 && !isProcessing && (
          <div className="animate-mp-fade-in py-8 text-center">
            {hasProvider ? (
              <p className="font-mp-body text-sm text-mp-text">
                Hello. I'm Moneypenny. What are we building today?
              </p>
            ) : (
              <div className="space-y-2">
                <p className="font-mp-body text-sm text-mp-text">
                  Hello. I'm Moneypenny.
                </p>
                <p className="text-xs text-mp-muted">
                  I'll need an AI model to work with. Open{' '}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-mp-gold underline decoration-mp-gold/30 underline-offset-2 hover:decoration-mp-gold"
                  >
                    Settings
                  </button>{' '}
                  to add an API key.
                </p>
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {isProcessing && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="border-t border-mp-border px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={hasProvider ? 'Ask Moneypenny...' : 'Configure an API key first'}
            disabled={!hasProvider}
            className="flex-1 rounded border border-mp-border bg-mp-surface px-3 py-2 text-sm text-mp-text placeholder-neutral-600 transition-colors focus:border-mp-gold focus:outline-none disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing || !hasProvider}
            className="rounded bg-mp-gold px-3 py-2 text-xs font-medium text-mp-bg transition-colors hover:bg-mp-gold-hover disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
