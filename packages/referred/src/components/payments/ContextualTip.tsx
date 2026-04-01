import { Heart, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const quickAmounts = [5, 10] as const;

interface ContextualTipProps {
  className?: string;
}

export default function ContextualTip({ className }: ContextualTipProps) {
  function handleTip(amount: number) {
    window.open(
      `https://buy.stripe.com/YOUR_LINK?amount=${amount * 100}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-4 sm:flex-row sm:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-2.5 text-center sm:text-left">
        <Heart className="h-4 w-4 shrink-0 text-primary-400" />
        <p className="text-sm text-gray-500">
          This research saved you hours{' '}
          <span className="hidden sm:inline">—</span>{' '}
          <span className="font-medium text-primary-700">drop us a thank you</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handleTip(amount)}
            aria-label={`Tip $${amount}`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            <CreditCard className="h-3 w-3" />
            ${amount}
          </button>
        ))}
      </div>
    </div>
  );
}
