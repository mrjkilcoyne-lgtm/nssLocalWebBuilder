// ---------------------------------------------------------------------------
// Onboarding — first-time welcome experience
// ---------------------------------------------------------------------------
// Design: private London members' club entrance. Understated luxury.
// Full dark screen, gold line draws itself, name fades in, greeting appears,
// three elegant options stagger in.
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback } from 'react'

type Choice = 'tour' | 'build' | 'import'

interface OnboardingProps {
  onChoice: (choice: Choice) => void
}

// ---------------------------------------------------------------------------
// Time-of-day aware greeting
// ---------------------------------------------------------------------------
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Onboarding({ onChoice }: OnboardingProps) {
  // Animation timeline phases
  const [phase, setPhase] = useState(0)
  // 0 = darkness (500ms)
  // 1 = gold line drawing (800ms)
  // 2 = name + subtitle fade in (600ms)
  // 3 = greeting text appears (600ms)
  // 4 = options stagger in

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1300),
      setTimeout(() => setPhase(3), 1900),
      setTimeout(() => setPhase(4), 2500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const [focusedIndex, setFocusedIndex] = useState(-1)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (phase < 4) return
      if (e.key === 'ArrowDown' || e.key === 'Tab') {
        e.preventDefault()
        setFocusedIndex((i) => (i + 1) % 3)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((i) => (i - 1 + 3) % 3)
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        const choices: Choice[] = ['tour', 'build', 'import']
        onChoice(choices[focusedIndex])
      }
    },
    [phase, focusedIndex, onChoice],
  )

  const greeting = getGreeting()

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#0a0a0a' }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="flex flex-col items-center gap-0 select-none">
        {/* Name */}
        <h1
          className="font-mp-serif text-mp-gold transition-all duration-700 ease-out"
          style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            letterSpacing: '0.05em',
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          Moneypenny
        </h1>

        {/* Gold line — draws itself from centre outward */}
        <div
          className="my-4 h-px transition-all ease-out"
          style={{
            backgroundColor: '#c9a96e',
            width: phase >= 1 ? 200 : 0,
            transitionDuration: '800ms',
          }}
        />

        {/* Subtitle */}
        <p
          className="font-mp-body italic text-mp-muted transition-all duration-700 ease-out"
          style={{
            fontSize: 'clamp(14px, 1.5vw, 18px)',
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          Your AI website architect
        </p>

        {/* Greeting */}
        <div
          className="mt-12 max-w-md text-center transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <p
            className="font-mp-body text-mp-text"
            style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}
          >
            {greeting}. I build websites.
          </p>
          <p
            className="mt-3 font-mp-body text-mp-text"
            style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}
          >
            Shall we begin?
          </p>
        </div>

        {/* Options */}
        <div className="mt-14 flex flex-col gap-4 w-full max-w-sm">
          {([
            {
              key: 'tour' as Choice,
              title: 'Show me around',
              subtitle: 'A guided tour of what\u2019s here',
              delay: 0,
            },
            {
              key: 'build' as Choice,
              title: 'Let\u2019s build',
              subtitle: 'Tell me what you need',
              delay: 200,
            },
            {
              key: 'import' as Choice,
              title: 'I have a site to import',
              subtitle: 'Upload an existing project',
              delay: 400,
            },
          ]).map((opt, i) => (
            <button
              key={opt.key}
              onClick={() => onChoice(opt.key)}
              onFocus={() => setFocusedIndex(i)}
              onMouseEnter={() => setFocusedIndex(i)}
              className={`
                group relative w-full rounded-lg border px-6 py-4 text-left
                transition-all duration-300 ease-out outline-none
                ${i === 1
                  ? 'border-mp-gold/40 hover:bg-mp-gold/10 focus-visible:bg-mp-gold/10'
                  : i === 2
                    ? 'border-mp-border hover:border-mp-gold/30 focus-visible:border-mp-gold/30'
                    : 'border-mp-gold/30 hover:border-mp-gold/60 focus-visible:border-mp-gold/60'
                }
                ${focusedIndex === i ? 'ring-1 ring-mp-gold/40' : ''}
              `}
              style={{
                opacity: phase >= 4 ? 1 : 0,
                transform: phase >= 4 ? 'translateY(0)' : 'translateY(16px)',
                transitionDelay: phase >= 4 ? `${opt.delay}ms` : '0ms',
              }}
              tabIndex={phase >= 4 ? 0 : -1}
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: '0 0 20px 0 rgba(201, 169, 110, 0.08)',
                }}
              />
              <span className="block font-mp-serif text-base text-mp-text">
                {opt.title}
              </span>
              <span className="mt-0.5 block text-sm text-mp-muted">
                {opt.subtitle}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
