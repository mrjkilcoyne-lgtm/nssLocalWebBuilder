import { Bitcoin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BitcoinDonateProps {
  className?: string;
  compact?: boolean;
}

export default function BitcoinDonate({ className }: BitcoinDonateProps) {
  return (
    <div
      className={cn(
        'card overflow-hidden border border-gray-100',
        className
      )}
    >
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-500/20">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-primary-900">Donate with Bitcoin</h3>
            <p className="text-xs text-gray-500">
              BTC and Lightning Network
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-6 text-center">
          <Bitcoin className="mx-auto h-6 w-6 text-orange-300" />
          <p className="mt-2 text-sm font-medium text-gray-500">
            BTC donations coming soon
          </p>
          <p className="mt-1 text-xs text-gray-400">
            We're setting up our wallet — check back shortly
          </p>
        </div>
      </div>
    </div>
  );
}
