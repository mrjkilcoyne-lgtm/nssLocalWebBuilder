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
      <span className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-400">
        Tip jar coming soon
      </span>
    </div>
  );
}
