import { Heart, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StripeTipJarProps {
  className?: string;
}

export default function StripeTipJar({ className }: StripeTipJarProps) {
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
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center">
          <CreditCard className="mx-auto h-6 w-6 text-gray-300" />
          <p className="mt-2 text-sm font-medium text-gray-500">
            Stripe tips coming soon
          </p>
          <p className="mt-1 text-xs text-gray-400">
            We're setting up our payment link — check back shortly
          </p>
        </div>
      </div>
    </div>
  );
}
