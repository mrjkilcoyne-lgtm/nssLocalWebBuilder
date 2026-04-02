import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Shield, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const CREDIT_COLORS: Record<string, string> = {
  AAA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  AA: 'bg-green-50 text-green-700 border-green-200',
  A: 'bg-green-50 text-green-700 border-green-200',
  'A+': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'A-': 'bg-lime-50 text-lime-700 border-lime-200',
  BBB: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  BB: 'bg-orange-50 text-orange-700 border-orange-200',
  B: 'bg-orange-50 text-orange-700 border-orange-200',
  'B+': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  NR: 'bg-gray-50 text-gray-600 border-gray-200',
};

function CreditBadge({ rating }: { rating: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold',
        CREDIT_COLORS[rating] || CREDIT_COLORS.NR
      )}
    >
      <Shield className="h-2.5 w-2.5" />
      {rating}
    </span>
  );
}

function StarRating({ value, count }: { value: number | null; count?: number }) {
  if (value === null) return null;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            'h-3 w-3',
            s <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-200'
          )}
        />
      ))}
      <span className="ml-1 text-xs text-gray-400">{value.toFixed(1)}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-gray-300">({count})</span>
      )}
    </div>
  );
}

function formatPrice(low: number | null, high: number | null, currency: string): string {
  const fmt = (n: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);
  };

  if (low === null && high === null) return 'Contact for pricing';
  if (low !== null && high !== null && low === high) return fmt(low);
  if (low !== null && high !== null) return `${fmt(low)} - ${fmt(high)}`;
  if (low !== null) return `From ${fmt(low)}`;
  return `Up to ${fmt(high!)}`;
}

function CompanyLogo({ name, logoUrl, websiteUrl }: { name: string; logoUrl: string | null; websiteUrl?: string | null }) {
  const [imgFailed, setImgFailed] = useState(false);

  // Try Clearbit logo API if no logo_url set (free, no auth)
  let clearbitUrl: string | null = null;
  try {
    if (websiteUrl) {
      const domain = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname.replace('www.', '');
      clearbitUrl = `https://logo.clearbit.com/${domain}`;
    }
  } catch {
    // invalid URL, skip
  }
  const src = logoUrl || clearbitUrl;

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={`${name} logo`}
        className="h-full w-full object-contain p-4"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return <LogoFallback name={name} />;
}

function LogoFallback({ name }: { name: string }) {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-emerald-400 to-emerald-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-cyan-400 to-cyan-600',
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br',
        colors[colorIdx]
      )}
    >
      <span className="text-2xl font-bold text-white">{name[0]}</span>
    </div>
  );
}

function getAffiliateUrl(product: Product): string | null {
  const links = product.affiliate_links;
  if (!links || links.length === 0) return null;
  // Prefer active direct link, then any active link
  const active = links.filter((l) => l.status === 'active');
  if (active.length === 0) return null;
  const direct = active.find((l) => l.link_type === 'direct');
  return direct?.url || active[0]?.url || null;
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const company = product.company;
  const affiliateUrl = getAffiliateUrl(product);

  return (
    <div
      className={cn(
        'card group relative transition-shadow hover:shadow-lg',
        viewMode === 'list' && 'flex items-center gap-4'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden',
          viewMode === 'grid' ? 'h-32 w-full mb-4' : 'h-16 w-16 shrink-0'
        )}
      >
        <CompanyLogo
          name={company?.name || product.name}
          logoUrl={company?.logo_url || null}
          websiteUrl={company?.website_url}
        />
      </div>

      <div className="flex-1">
        {/* Company name */}
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {company?.name || 'Unknown'}
        </p>

        {/* Product name */}
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="mt-0.5 font-semibold text-primary-900 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Credit + stars */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {company && <CreditBadge rating={company.credit_rating} />}
          {company && (
            <StarRating
              value={company.google_review_score}
              count={company.google_review_count}
            />
          )}
        </div>

        {/* Modality + beginner badge */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-600 border border-primary-100">
            {product.modality}
          </span>
          {product.beginner_friendly && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-100">
              <Sparkles className="h-2.5 w-2.5" />
              Beginner
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-800">
            {formatPrice(product.price_range_low, product.price_range_high, product.currency)}
          </span>
          {affiliateUrl ? (
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md active:scale-95"
            >
              Get Deal
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <Link
              to={`/product/${product.slug}`}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md active:scale-95"
            >
              Get Deal
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
