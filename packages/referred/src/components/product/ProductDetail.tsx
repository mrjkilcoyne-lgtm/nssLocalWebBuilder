import { Star, Shield, CheckCircle2, Share2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, Company } from '@/types/catalog';

interface ProductDetailProps {
  product: Product;
  company: Company | null;
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

function StarRating({ value, count }: { value: number | null; count?: number }) {
  if (value === null) return null;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            'h-4 w-4',
            s <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-200'
          )}
        />
      ))}
      <span className="ml-1 text-sm text-gray-500">{value.toFixed(1)} / 5.0</span>
      {count !== undefined && count > 0 && (
        <span className="text-sm text-gray-400">({count} reviews)</span>
      )}
    </div>
  );
}

function formatPrice(low: number | null, high: number | null, currency: string): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);

  if (low === null && high === null) return 'Contact for pricing';
  if (low !== null && high !== null && low === high) return fmt(low);
  if (low !== null && high !== null) return `${fmt(low)} - ${fmt(high)}`;
  if (low !== null) return `From ${fmt(low)}`;
  return `Up to ${fmt(high!)}`;
}

const REGION_LABELS: Record<string, string> = {
  US: 'United States',
  EU: 'Europe',
  CN: 'China',
  ROW: 'Rest of World',
};

export default function ProductDetail({ product, company }: ProductDetailProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Left: Image */}
      <div className="space-y-4">
        <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/30 flex items-center justify-center">
          <div className="text-center">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} logo`}
                className="mx-auto h-20 w-20 object-contain"
              />
            ) : (
              <div className="mx-auto h-20 w-20 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-primary-300">
                  {(company?.name || product.name)[0].toUpperCase()}
                </span>
              </div>
            )}
            <p className="text-sm text-primary-400 mt-4">{company?.name || 'Product'}</p>
          </div>
        </div>
      </div>

      {/* Right: Details */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-primary-500 uppercase tracking-wider">
              {company?.name || 'Unknown'}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-primary-900 sm:text-4xl">
              {product.name}
            </h1>
          </div>
          <button className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:text-primary-500 hover:border-primary-200 transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Rating + credit */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {company && (
            <StarRating
              value={company.google_review_score}
              count={company.google_review_count}
            />
          )}
          {company && (
            <>
              <span className="text-sm text-gray-400">|</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold',
                  CREDIT_COLORS[company.credit_rating] || CREDIT_COLORS.NR
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                {company.credit_rating} Credit
              </span>
            </>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-6 space-y-2">
            {product.tags.map((tag) => (
              <div key={tag} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-primary-500" />
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Modality + beginner badge */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 border border-primary-100">
            {product.modality}
          </span>
          {product.beginner_friendly && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 border border-emerald-100">
              Beginner Friendly
            </span>
          )}
        </div>

        {/* Region availability */}
        {product.regions && product.regions.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Available in
            </p>
            <div className="flex flex-wrap gap-2">
              {product.regions.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
                >
                  <Globe className="h-3 w-3" />
                  {REGION_LABELS[r] || r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price box */}
        <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary-900">
              {formatPrice(product.price_range_low, product.price_range_high, product.currency)}
            </span>
          </div>
          {company?.website_url && (
            <a
              href={company.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors"
            >
              Visit {company.name} website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
