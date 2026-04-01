// ---------------------------------------------------------------------------
// Onboarding — first-time welcome experience
// ---------------------------------------------------------------------------
// Design: entering a warm, grand London private office.
// Deep walnut panelling, brass fixtures, the glow of a desk lamp,
// thick carpet, a fire somewhere nearby. Reassuringly wealthy.
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
  const [phase, setPhase] = useState(0)
  // 0 = darkness — the door is still closed (600ms)
  // 1 = warm light seeps in, brass line draws (1000ms)
  // 2 = name + subtitle fade in with warmth (800ms)
  // 3 = greeting appears like someone speaking (700ms)
  // 4 = options stagger in like offered chairs

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3100),
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: phase >= 1
          ? 'radial-gradient(ellipse at 50% 40%, #1f1b14 0%, #14120d 40%, #0d0b08 100%)'
          : '#0a0908',
        transition: 'background 1.5s ease-out',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Warm ambient glow — simulating desk lamp / firelight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(201, 169, 110, 0.07) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(212, 165, 116, 0.03) 0%, transparent 40%)',
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 2s ease-out',
        }}
      />

      {/* Subtle grain texture — like looking at fine paper */}
      <div
        className="pointer-events-none absolute inset-0 bg-mp-grain mix-blend-overlay"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 1.5s ease-out',
        }}
      />

      {/* Vignette — the warm darkness at the edges of a lamplit room */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10, 9, 8, 0.5) 100%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-0 select-none px-6">
        {/* Decorative flourish above name — like an engraved letterhead */}
        <div
          className="mb-6 flex items-center gap-3"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transition: 'opacity 1s ease-out',
            transitionDelay: '200ms',
          }}
        >
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-mp-gold/30" />
          <div className="h-1 w-1 rotate-45 bg-mp-gold/40" />
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-mp-gold/30" />
        </div>

        {/* Name — the brass nameplate */}
        <h1
          className="font-mp-display tracking-[0.12em] text-mp-cream"
          style={{
            fontSize: 'clamp(42px, 6vw, 72px)',
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 1s ease-out, transform 1s ease-out',
            textShadow: '0 0 60px rgba(201, 169, 110, 0.15)',
          }}
        >
          MP
        </h1>

        {/* Gold line — a brass rule, drawing itself from the centre */}
        <div
          className="my-5 h-px"
          style={{
            background: 'linear-gradient(to right, transparent, #c9a96e 30%, #dbb87a 50%, #c9a96e 70%, transparent)',
            width: phase >= 1 ? 240 : 0,
            opacity: phase >= 1 ? 1 : 0,
            transition: 'width 1.2s ease-out, opacity 0.8s ease-out',
          }}
        />

        {/* Subtitle */}
        <p
          className="font-mp-body text-mp-muted tracking-[0.15em] uppercase"
          style={{
            fontSize: 'clamp(11px, 1.2vw, 14px)',
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 1s ease-out 300ms, transform 1s ease-out 300ms',
            letterSpacing: '0.2em',
          }}
        >
          The augmenting intelligence platform
        </p>

        {/* Greeting — spoken warmly, as if from a chair by the fire */}
        <div
          className="mt-14 max-w-md text-center"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.9s ease-out, transform 0.9s ease-out',
          }}
        >
          <p
            className="font-mp-body text-mp-text-warm leading-relaxed"
            style={{ fontSize: 'clamp(19px, 2.2vw, 24px)' }}
          >
            {greeting}.
          </p>
          <p
            className="mt-2 font-mp-body text-mp-text-warm leading-relaxed"
            style={{ fontSize: 'clamp(19px, 2.2vw, 24px)' }}
          >
            What are we building today?
          </p>
        </div>

        {/* Options — three elegant invitations, like leather-bound menus */}
        <div className="mt-14 flex flex-col gap-3.5 w-full max-w-sm">
          {([
            {
              key: 'tour' as Choice,
              title: 'Show me around',
              subtitle: 'A guided tour of the platform',
              delay: 0,
            },
            {
              key: 'build' as Choice,
              title: 'Let\u2019s build',
              subtitle: 'Tell me what you need',
              delay: 150,
            },
            {
              key: 'import' as Choice,
              title: 'I have a site to import',
              subtitle: 'Bring existing work in',
              delay: 300,
            },
          ]).map((opt, i) => (
            <button
              key={opt.key}
              onClick={() => onChoice(opt.key)}
              onFocus={() => setFocusedIndex(i)}
              onMouseEnter={() => setFocusedIndex(i)}
              className={`
                group relative w-full rounded-lg px-7 py-5 text-left
                transition-all duration-500 ease-out outline-none
                border
                ${focusedIndex === i
                  ? 'border-mp-gold/40 bg-mp-gold/[0.04] shadow-mp-glow'
                  : 'border-mp-border/60 bg-transparent hover:border-mp-gold/30 hover:bg-mp-gold/[0.02]'
                }
              `}
              style={{
                opacity: phase >= 4 ? 1 : 0,
                transform: phase >= 4 ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.6s ease-out ${opt.delay}ms, transform 0.6s ease-out ${opt.delay}ms, border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease`,
              }}
              tabIndex={phase >= 4 ? 0 : -1}
            >
              <span className="block font-mp-serif text-base text-mp-cream tracking-wide">
                {opt.title}
              </span>
              <span className="mt-1 block text-sm text-mp-muted">
                {opt.subtitle}
              </span>

              {/* Subtle arrow that appears on hover */}
              <span
                className={`
                  absolute right-6 top-1/2 -translate-y-1/2 font-mp-body text-mp-gold/60
                  transition-all duration-300
                  ${focusedIndex === i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                `}
              >
                &rsaquo;
              </span>
            </button>
          ))}
        </div>

        {/* Footer flourish */}
        <div
          className="mt-12 flex items-center gap-3"
          style={{
            opacity: phase >= 4 ? 0.4 : 0,
            transition: 'opacity 1s ease-out 500ms',
          }}
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-mp-border" />
          <span className="font-mp-mono text-[9px] tracking-[0.3em] text-mp-muted-warm uppercase">
            nssLocalWebBuilder
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-mp-border" />
        </div>
      </div>
    </div>
  )
}
