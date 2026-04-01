import { useState } from 'react';
import { CreditCard, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const presetAmounts = [5, 10, 25] as const;

interface StripeTipJarProps {
  className?: string;
}

export default function StripeTipJar({ className }: StripeTipJarProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [selected, setSelected] = useState<number | 'custom'>(10);

  function handleTip() {
    const amount = selected === 'custom' ? Number(customAmount) : selected;
    if (!amount || amount <= 0) return;
    window.open(
      `https://buy.stripe.com/YOUR_LINK?amount=${amount * 100}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <div
      className={cn(
        'card overflow-hidden border border-gray-100',
        className
      )}
    >
      <div className="bg-gradient-to-br from-primary-50 to-indigo-50 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 shadow-sm shadow-primary-500/20">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-primary-900">Support our research</h3>
            <p className="text-xs text-gray-500">
              100% goes to keeping REFERRED free and independent
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-2">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelected(amount)}
              aria-label={`Tip $${amount}`}
              className={cn(
                'rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-150',
                selected === amount
                  ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500/30'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              ${amount}
            </button>
          ))}
          <button
            onClick={() => setSelected('custom')}
            aria-label="Enter custom tip amount"
            className={cn(
              'rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-150',
              selected === 'custom'
                ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500/30'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            Custom
          </button>
        </div>

        {selected === 'custom' && (
          <div className="mt-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                $
              </span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                aria-label="Custom tip amount in dollars"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-3 text-sm text-primary-900 placeholder:text-gray-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleTip}
          disabled={selected === 'custom' && (!customAmount || Number(customAmount) <= 0)}
          aria-label="Complete tip with card"
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-150',
            'bg-primary-500 hover:bg-primary-600 shadow-sm shadow-primary-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <CreditCard className="h-4 w-4" />
          Tip{' '}
          {selected === 'custom'
            ? customAmount
              ? `$${customAmount}`
              : ''
            : `$${selected}`}{' '}
          with Card
        </button>
      </div>
    </div>
  );
}
