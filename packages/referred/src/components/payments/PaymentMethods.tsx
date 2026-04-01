import { useState } from 'react';
import {
  CreditCard,
  Building2,
  Bitcoin,
  Wallet,
  Heart,
  Github,
  Banknote,
  Copy,
  Check,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StripeTipJar from './StripeTipJar';
import BitcoinDonate from './BitcoinDonate';

const BTC_ADDRESS = 'bc1qreferred000000000000000000000';

interface PaymentCard {
  id: string;
  icon: typeof CreditCard;
  name: string;
  description: string;
  cta: string;
  color: string;
  iconBg: string;
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
  },
  {
    id: 'gocardless',
    icon: Building2,
    name: 'GoCardless',
    description: 'UK/EU Direct Debit',
    cta: 'Set Up Monthly',
    color: 'border-teal-100',
    iconBg: 'bg-teal-50 text-teal-600',
  },
  {
    id: 'bitcoin',
    icon: Bitcoin,
    name: 'Bitcoin',
    description: 'BTC & Lightning',
    cta: '',
    color: 'border-orange-100',
    iconBg: 'bg-orange-50 text-orange-600',
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
    id: 'bmac',
    icon: Heart,
    name: 'Buy Me a Coffee',
    description: 'Quick & Easy',
    cta: 'Buy a Coffee',
    color: 'border-yellow-100',
    iconBg: 'bg-yellow-50 text-yellow-600',
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
  gocardless: 'https://pay.gocardless.com/YOUR_LINK',
  paypal: 'https://paypal.me/YOURHANDLE',
  bmac: 'https://buymeacoffee.com/YOURHANDLE',
  github: 'https://github.com/sponsors/YOURHANDLE',
};

function BankDetails() {
  const [copied, setCopied] = useState(false);
  const details = 'Sort: 00-00-00 | Acc: 12345678';

  async function copy() {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="rounded-lg bg-gray-50 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Sort Code</p>
            <p className="text-sm font-mono font-semibold text-primary-900">00-00-00</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Account</p>
            <p className="text-sm font-mono font-semibold text-primary-900">12345678</p>
          </div>
          <button
            onClick={copy}
            aria-label={copied ? 'Copied' : 'Copy bank details'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border transition-all',
              copied
                ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                : 'border-gray-200 text-gray-400 hover:bg-gray-100'
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function InlineBitcoin() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(BTC_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
        <code className="flex-1 truncate text-xs font-mono text-gray-600">
          {BTC_ADDRESS}
        </code>
        <button
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy Bitcoin address'}
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all',
            copied
              ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
              : 'border-gray-200 text-gray-400 hover:bg-gray-100'
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-amber-600">
        <Zap className="h-3 w-3" />
        Lightning also available
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
              method.color
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
                <h3 className="font-semibold text-primary-900">{method.name}</h3>
                <p className="mt-0.5 text-xs text-gray-400">{method.description}</p>
              </div>
            </div>

            {/* Inline content for Bitcoin */}
            {method.id === 'bitcoin' && <InlineBitcoin />}

            {/* Inline content for Bank Transfer */}
            {method.id === 'bank' && <BankDetails />}

            {/* CTA Button for methods with external links or modals */}
            {method.cta && (
              <button
                onClick={() => handleClick(method)}
                aria-label={method.cta}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                {method.cta}
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </button>
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
