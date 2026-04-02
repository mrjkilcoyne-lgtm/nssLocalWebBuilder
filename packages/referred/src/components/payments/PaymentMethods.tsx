import { useState } from 'react';
import {
  CreditCard,
  Building2,
  Bitcoin,
  Wallet,
  Heart,
  Github,
  Banknote,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StripeTipJar from './StripeTipJar';
import BitcoinDonate from './BitcoinDonate';

interface PaymentCard {
  id: string;
  icon: typeof CreditCard;
  name: string;
  description: string;
  cta: string;
  color: string;
  iconBg: string;
  comingSoon?: boolean;
}

const methods: PaymentCard[] = [
  {
    id: 'stripe',
    icon: CreditCard,
    name: 'Stripe',
    description: 'One-time or recurring',
    cta: 'Tip with Card',
    color: 'border-indigo-100',
    iconBg: 'bg-indigo-50 text-indigo-600',
    comingSoon: true,
  },
  {
    id: 'paypal',
    icon: Wallet,
    name: 'PayPal',
    description: 'Universal',
    cta: 'Donate via PayPal',
    color: 'border-blue-100',
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'github',
    icon: Github,
    name: 'GitHub Sponsors',
    description: 'For Developers',
    cta: 'Sponsor on GitHub',
    color: 'border-gray-200',
    iconBg: 'bg-gray-100 text-gray-700',
  },
  {
    id: 'gocardless',
    icon: Building2,
    name: 'GoCardless',
    description: 'UK/EU Direct Debit',
    cta: 'Set Up Monthly',
    color: 'border-teal-100',
    iconBg: 'bg-teal-50 text-teal-600',
    comingSoon: true,
  },
  {
    id: 'bitcoin',
    icon: Bitcoin,
    name: 'Bitcoin',
    description: 'BTC & Lightning',
    cta: '',
    color: 'border-orange-100',
    iconBg: 'bg-orange-50 text-orange-600',
    comingSoon: true,
  },
  {
    id: 'bmac',
    icon: Heart,
    name: 'Buy Me a Coffee',
    description: 'Quick & Easy',
    cta: 'Buy a Coffee',
    color: 'border-yellow-100',
    iconBg: 'bg-yellow-50 text-yellow-600',
    comingSoon: true,
  },
  {
    id: 'bank',
    icon: Banknote,
    name: 'Bank Transfer',
    description: 'Direct Transfer',
    cta: '',
    color: 'border-emerald-100',
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
];

const externalLinks: Record<string, string> = {
  paypal: 'https://paypal.me/mrjkilcoyne',
  github: 'https://github.com/sponsors/mrjkilcoyne-lgtm',
};

function BankContactInfo() {
  return (
    <div className="mt-3">
      <div className="rounded-lg bg-gray-50 px-3 py-3 text-center">
        <Mail className="mx-auto h-4 w-4 text-gray-400" />
        <p className="mt-1.5 text-xs text-gray-500">
          Contact{' '}
          <a
            href="mailto:mrjkilcoyne@gmail.com"
            className="font-medium text-primary-600 hover:text-primary-700 underline"
          >
            mrjkilcoyne@gmail.com
          </a>
          {' '}for bank details
        </p>
      </div>
    </div>
  );
}

function ComingSoonInline() {
  return (
    <div className="mt-3">
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-3 py-2 text-center">
        <p className="text-xs text-gray-400">Coming soon</p>
      </div>
    </div>
  );
}

interface PaymentMethodsProps {
  className?: string;
}

export default function PaymentMethods({ className }: PaymentMethodsProps) {
  const [stripeOpen, setStripeOpen] = useState(false);
  const [bitcoinOpen, setBitcoinOpen] = useState(false);

  function handleClick(method: PaymentCard) {
    if (method.comingSoon) return;
    if (method.id === 'stripe') {
      setStripeOpen(!stripeOpen);
      return;
    }
    if (method.id === 'bitcoin') {
      setBitcoinOpen(!bitcoinOpen);
      return;
    }
    const url = externalLinks[method.id];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className={cn(
              'card overflow-hidden border p-5 transition-all duration-150',
              method.color,
              method.comingSoon && 'opacity-60'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  method.iconBg
                )}
              >
                <method.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary-900">{method.name}</h3>
                  {method.comingSoon && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                      Soon
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{method.description}</p>
              </div>
            </div>

            {/* Inline coming-soon for Bitcoin */}
            {method.id === 'bitcoin' && <ComingSoonInline />}

            {/* Inline content for Bank Transfer */}
            {method.id === 'bank' && <BankContactInfo />}

            {/* CTA Button for methods with external links or modals */}
            {method.cta && !method.comingSoon && (
              <button
                onClick={() => handleClick(method)}
                aria-label={method.cta}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                {method.cta}
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </button>
            )}

            {/* Coming soon CTA placeholder */}
            {method.cta && method.comingSoon && (
              <div className="mt-4 flex w-full items-center justify-center rounded-xl border border-dashed border-gray-200 px-3 py-2.5 text-sm text-gray-400">
                Coming soon
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expanded Stripe Tip Jar */}
      {stripeOpen && (
        <div className="mx-auto max-w-md">
          <StripeTipJar />
        </div>
      )}

      {/* Expanded Bitcoin Donate */}
      {bitcoinOpen && (
        <div className="mx-auto max-w-md">
          <BitcoinDonate />
        </div>
      )}
    </div>
  );
}
