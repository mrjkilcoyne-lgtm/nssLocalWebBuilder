import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualTipProps {
  className?: string;
}

export default function ContextualTip({ className }: ContextualTipProps) {
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
      <a
        href="https://buy.stripe.com/4gMcN58ea8ambK72g6dfG04"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-primary-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Tip with Card
      </a>
    </div>
  );
}
