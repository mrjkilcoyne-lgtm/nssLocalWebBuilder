import { Heart, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const STRIPE_LINK = 'https://buy.stripe.com/4gMcN58ea8ambK72g6dfG04';

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
        <a
          href={STRIPE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-primary-500/20 transition-all hover:bg-primary-600 hover:shadow-md active:scale-[0.98]"
        >
          <CreditCard className="h-4 w-4" />
          Tip with Card
        </a>
        <p className="mt-2 text-center text-xs text-gray-400">
          Choose your amount on the next page
        </p>
      </div>
    </div>
  );
}
