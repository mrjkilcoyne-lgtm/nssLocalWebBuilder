import { useState, useEffect, useRef } from 'react';
import { Heart, X, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const quickAmounts = [5, 10, 25] as const;
const DISMISSED_KEY = 'referred-tip-dismissed';

export default function TipButton() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fade in after 5 seconds
  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleDismiss() {
    setDismissed(true);
    setOpen(false);
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // sessionStorage may be unavailable
    }
  }

  function handleTip(amount: number) {
    window.open(
      `https://buy.stripe.com/YOUR_LINK?amount=${amount * 100}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  if (dismissed) return null;

  return (
    <div
      ref={popoverRef}
      className={cn(
        'fixed bottom-6 right-6 z-50 transition-all duration-500',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      )}
    >
      {/* Popover */}
      {open && (
        <div className="absolute bottom-14 right-0 mb-2 w-64 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-primary-900">
              Quick Tip
            </span>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss tip button"
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mb-3 text-xs text-gray-500">
            Support REFERRED — keeps it free for everyone.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleTip(amount)}
                aria-label={`Tip $${amount}`}
                className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700"
              >
                <CreditCard className="h-3 w-3" />
                ${amount}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open tip jar"
        className={cn(
          'flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-150',
          'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30 hover:shadow-primary-500/40',
          open && 'ring-2 ring-primary-300'
        )}
      >
        <Heart className="h-4 w-4" />
        Tip
      </button>
    </div>
  );
}
