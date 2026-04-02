import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  User,
  Sparkles,
  ExternalLink,
  Star,
  Shield,
  RotateCcw,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegionStore } from '@/stores/regionStore';
import { supabase } from '@/lib/supabase';
import RegionToggle from '@/components/RegionToggle';
import type { Product } from '@/types/catalog';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type WizardStep = 'goal' | 'budget' | 'modalities' | 'experience' | 'results';

interface WizardState {
  goal: string | null;
  budget: string | null;
  modalities: string[];
  experience: string | null;
}

interface ChatEntry {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  widget?: WizardStep;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GOALS = [
  { label: 'Home Lab', value: 'home_lab' },
  { label: 'Business Infra', value: 'business_infra' },
  { label: 'Creative Setup', value: 'creative_setup' },
  { label: 'Dev Stack', value: 'dev_stack' },
  { label: 'Smart Home', value: 'smart_home' },
  { label: 'Not Sure', value: 'not_sure' },
];

const BUDGETS = [
  { label: 'Under \u00a3200', value: 'under_200', min: 0, max: 200 },
  { label: '\u00a3200\u2013500', value: '200_500', min: 200, max: 500 },
  { label: '\u00a3500\u20131,000', value: '500_1000', min: 500, max: 1000 },
  { label: '\u00a31,000\u20133,000', value: '1000_3000', min: 1000, max: 3000 },
  { label: '\u00a33,000+', value: '3000_plus', min: 3000, max: null },
  { label: 'No Budget', value: 'no_budget', min: null, max: null },
];

const MODALITIES = [
  { label: 'Compute (GPUs/CPUs)', value: 'compute' },
  { label: 'Audio (Mics/Speakers)', value: 'audio' },
  { label: 'Video (Cameras/Streaming)', value: 'video' },
  { label: 'Networking', value: 'networking' },
  { label: 'Storage', value: 'storage' },
  { label: 'Software / Cloud', value: 'software' },
];

const EXPERIENCE_LEVELS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

const STEP_META: { key: WizardStep; label: string }[] = [
  { key: 'goal', label: 'Your Goal' },
  { key: 'budget', label: 'Budget' },
  { key: 'modalities', label: 'Modalities' },
  { key: 'experience', label: 'Experience' },
  { key: 'results', label: 'Your Stack' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function humanLabel(
  options: { label: string; value: string }[],
  value: string | null,
): string {
  if (!value) return '';
  return options.find((o) => o.value === value)?.label ?? value;
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
  if (low !== null && high !== null) return `${fmt(low)} \u2013 ${fmt(high)}`;
  if (low !== null) return `From ${fmt(low)}`;
  return `Up to ${fmt(high!)}`;
}

function getAffiliateUrl(product: Product): string | null {
  const links = product.affiliate_links;
  if (!links || links.length === 0) return null;
  const active = links.filter((l) => l.status === 'active');
  if (active.length === 0) return null;
  const direct = active.find((l) => l.link_type === 'direct');
  return direct?.url || active[0]?.url || null;
}

/* ------------------------------------------------------------------ */
/*  Small UI pieces                                                    */
/* ------------------------------------------------------------------ */

function CreditBadge({ rating }: { rating: string }) {
  const COLORS: Record<string, string> = {
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
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold',
        COLORS[rating] || COLORS.NR,
      )}
    >
      <Shield className="h-2.5 w-2.5" />
      {rating}
    </span>
  );
}

function StarRating({ value }: { value: number | null }) {
  if (value === null) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            'h-3 w-3',
            s <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-200',
          )}
        />
      ))}
      <span className="ml-1 text-xs text-gray-400">{value.toFixed(1)}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bubble wrapper                                                     */
/* ------------------------------------------------------------------ */

function Bubble({
  role,
  children,
}: {
  role: 'assistant' | 'user';
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn('flex gap-3', role === 'user' && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
          role === 'assistant'
            ? 'bg-primary-100 text-primary-600'
            : 'bg-gray-100 text-gray-500',
        )}
      >
        {role === 'assistant' ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          role === 'assistant'
            ? 'rounded-tl-md border border-gray-100 bg-white text-gray-700 shadow-sm'
            : 'rounded-tr-md bg-primary-500 text-white',
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recommendation Card (inline, not importing ProductCard to keep it  */
/*  slim & self-contained for the advisor context)                     */
/* ------------------------------------------------------------------ */

function RecommendationCard({ product }: { product: Product }) {
  const company = product.company;
  const url = getAffiliateUrl(product);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-full w-full object-contain p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-lg font-bold text-primary-500">
              {(company?.name || product.name)[0]}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            {company?.name || 'Unknown'}
          </p>
          <Link
            to={`/product/${product.slug}`}
            className="block truncate font-semibold text-primary-900 hover:text-primary-600 transition-colors"
          >
            {product.name}
          </Link>
          {product.description && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {company && <CreditBadge rating={company.credit_rating} />}
        {company && <StarRating value={company.google_review_score} />}
        <span className="rounded-full border border-primary-100 bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-600">
          {product.modality}
        </span>
        {product.beginner_friendly && (
          <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
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
        {url ? (
          <a
            href={url}
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
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Advisor() {
  const region = useRegionStore((s) => s.region);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<WizardStep>('goal');
  const [wizard, setWizard] = useState<WizardState>({
    goal: null,
    budget: null,
    modalities: [],
    experience: null,
  });
  const [chat, setChat] = useState<ChatEntry[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        "Hey! I\u2019m REFERRED\u2019s AI Advisor. I\u2019ll help you find the perfect stack for your needs.\n\nLet\u2019s start \u2014 what are you trying to build?",
      widget: 'goal',
    },
  ]);
  const [pendingModalities, setPendingModalities] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-scroll
  useEffect(() => {
    // Small delay so the DOM has rendered the new content
    const t = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(t);
  }, [chat, loading]);

  /* ---- Progress index ---- */
  const stepIndex = STEP_META.findIndex((s) => s.key === step);

  /* ---- Helpers to append chat ---- */
  const nextId = useRef(2);
  const addMessages = useCallback(
    (...msgs: Omit<ChatEntry, 'id'>[]) => {
      const entries = msgs.map((m) => ({ ...m, id: nextId.current++ }));
      setChat((prev) => [...prev, ...entries]);
    },
    [],
  );

  /* ---- Fetch recommendations ---- */
  const fetchRecommendations = useCallback(
    async (state: WizardState) => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select(
            '*, company:companies(*), affiliate_links!affiliate_links_product_id_fkey(*)',
          );

        // Region
        query = query.contains('regions', [region]);

        // Modalities
        if (state.modalities.length > 0) {
          query = query.in('modality', state.modalities);
        }

        // Budget
        if (state.budget && state.budget !== 'no_budget') {
          const budgetObj = BUDGETS.find((b) => b.value === state.budget);
          if (budgetObj) {
            if (budgetObj.min !== null) {
              // We want products whose low price is at least within range
              // price_range_low <= max (affordable) OR price_range_high >= min (overlaps)
            }
            if (budgetObj.max !== null) {
              query = query.or(
                `price_range_low.lte.${budgetObj.max},price_range_low.is.null`,
              );
            }
            if (budgetObj.min !== null && budgetObj.min > 0) {
              query = query.or(
                `price_range_high.gte.${budgetObj.min},price_range_high.is.null`,
              );
            }
          }
        }

        // Beginner-friendly filter
        if (state.experience === 'beginner') {
          query = query.eq('beginner_friendly', true);
        }

        // Sort by google review score descending (via company join not possible in supabase-js,
        // so we sort client-side after fetch)
        query = query.limit(30);

        const { data, error } = await query;
        if (error) throw error;

        // Client-side sort by google_review_score descending
        const sorted = (data as Product[]).sort((a, b) => {
          const scoreA = a.company?.google_review_score ?? 0;
          const scoreB = b.company?.google_review_score ?? 0;
          return scoreB - scoreA;
        });

        setProducts(sorted.slice(0, 12));
      } catch (err) {
        console.error('Advisor query failed:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [region],
  );

  /* ---- Step handlers ---- */

  const handleGoal = (value: string) => {
    const label = humanLabel(GOALS, value);
    setWizard((s) => ({ ...s, goal: value }));
    addMessages(
      { role: 'user', content: label },
      {
        role: 'assistant',
        content: `Great choice! Now let\u2019s talk budget. What range works for you?`,
        widget: 'budget',
      },
    );
    setStep('budget');
  };

  const handleBudget = (value: string) => {
    const label = humanLabel(BUDGETS, value);
    setWizard((s) => ({ ...s, budget: value }));
    addMessages(
      { role: 'user', content: label },
      {
        role: 'assistant',
        content: `Got it. Which modalities do you need? Pick all that apply.`,
        widget: 'modalities',
      },
    );
    setPendingModalities([]);
    setStep('modalities');
  };

  const toggleModality = (value: string) => {
    setPendingModalities((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };

  const handleModalitiesNext = () => {
    const selected = pendingModalities.length > 0 ? pendingModalities : MODALITIES.map((m) => m.value);
    const labels = selected
      .map((v) => humanLabel(MODALITIES, v))
      .join(', ');
    setWizard((s) => ({ ...s, modalities: selected }));
    addMessages(
      { role: 'user', content: labels || 'All modalities' },
      {
        role: 'assistant',
        content: `Almost done! What\u2019s your experience level?`,
        widget: 'experience',
      },
    );
    setStep('experience');
  };

  const handleExperience = (value: string) => {
    const label = humanLabel(EXPERIENCE_LEVELS, value);
    const updatedWizard = { ...wizard, experience: value };
    setWizard(updatedWizard);
    addMessages(
      { role: 'user', content: label },
      {
        role: 'assistant',
        content: `Searching for the best products in ${region} that match your requirements...`,
      },
    );
    setStep('results');
    fetchRecommendations(updatedWizard);
  };

  const handleStartOver = () => {
    nextId.current = 2;
    setStep('goal');
    setWizard({ goal: null, budget: null, modalities: [], experience: null });
    setProducts([]);
    setPendingModalities([]);
    setChat([
      {
        id: 1,
        role: 'assistant',
        content:
          "Let\u2019s start fresh! What are you trying to build?",
        widget: 'goal',
      },
    ]);
  };

  /* ---- Estimate total cost ---- */
  const estimatedTotal = products.reduce((sum, p) => {
    return sum + (p.price_range_low ?? p.price_range_high ?? 0);
  }, 0);

  const currency = products[0]?.currency ?? 'USD';

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="container-page flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary-900">
                AI Advisor
              </h1>
              <p className="text-xs text-gray-400">
                Personalized stack recommendations
              </p>
            </div>
          </div>
          <RegionToggle compact />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 sm:px-6">
        <div className="container-page">
          <div className="flex items-center gap-2">
            {STEP_META.map((sm, i) => (
              <div key={sm.key} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={cn(
                      'h-px w-6 sm:w-10',
                      i <= stepIndex ? 'bg-primary-400' : 'bg-gray-200',
                    )}
                  />
                )}
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                      i < stepIndex
                        ? 'bg-primary-500 text-white'
                        : i === stepIndex
                          ? 'bg-primary-500 text-white ring-2 ring-primary-200'
                          : 'bg-gray-200 text-gray-400',
                    )}
                  >
                    {i < stepIndex ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      'hidden text-xs font-medium sm:inline',
                      i <= stepIndex
                        ? 'text-primary-700'
                        : 'text-gray-400',
                    )}
                  >
                    {sm.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="container-page max-w-3xl space-y-4">
          {chat.map((entry) => (
            <div key={entry.id}>
              <Bubble role={entry.role}>
                {entry.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                    {line}
                  </p>
                ))}
              </Bubble>

              {/* Inline widget buttons that sit below the assistant bubble */}
              {entry.role === 'assistant' && entry.widget === 'goal' && step === 'goal' && (
                <div className="ml-11 mt-3 flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => handleGoal(g.value)}
                      className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 transition-all hover:bg-primary-100 hover:border-primary-300 active:scale-95"
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              )}

              {entry.role === 'assistant' && entry.widget === 'budget' && step === 'budget' && (
                <div className="ml-11 mt-3 flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => handleBudget(b.value)}
                      className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 transition-all hover:bg-primary-100 hover:border-primary-300 active:scale-95"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              )}

              {entry.role === 'assistant' && entry.widget === 'modalities' && step === 'modalities' && (
                <div className="ml-11 mt-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {MODALITIES.map((m) => {
                      const selected = pendingModalities.includes(m.value);
                      return (
                        <button
                          key={m.value}
                          onClick={() => toggleModality(m.value)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all active:scale-95',
                            selected
                              ? 'border-primary-400 bg-primary-500 text-white shadow-sm'
                              : 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 hover:border-primary-300',
                          )}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleModalitiesNext}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-600 active:scale-95"
                  >
                    {pendingModalities.length === 0 ? 'All of the above' : 'Next'}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              {entry.role === 'assistant' && entry.widget === 'experience' && step === 'experience' && (
                <div className="ml-11 mt-3 flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((e) => (
                    <button
                      key={e.value}
                      onClick={() => handleExperience(e.value)}
                      className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700 transition-all hover:bg-primary-100 hover:border-primary-300 active:scale-95"
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading spinner */}
          {loading && (
            <Bubble role="assistant">
              <span className="inline-flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding the best deals for you...
              </span>
            </Bubble>
          )}

          {/* Results */}
          {step === 'results' && !loading && products.length > 0 && (
            <div className="space-y-4">
              <Bubble role="assistant">
                <p className="font-semibold">
                  Your Recommended Stack ({products.length} product
                  {products.length !== 1 ? 's' : ''})
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Estimated starting cost:{' '}
                  <span className="font-semibold text-primary-700">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(estimatedTotal)}
                  </span>
                </p>
              </Bubble>

              <div className="ml-11 grid gap-3 sm:grid-cols-2">
                {products.map((p) => (
                  <RecommendationCard key={p.id} product={p} />
                ))}
              </div>

              <div className="ml-11">
                <button
                  onClick={handleStartOver}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                >
                  <RotateCcw className="h-3 w-3" />
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* No results */}
          {step === 'results' && !loading && products.length === 0 && (
            <div className="space-y-3">
              <Bubble role="assistant">
                <p>
                  Hmm, I couldn't find any products matching all your criteria
                  in the {region} region. Try broadening your selections or
                  changing your region.
                </p>
              </Bubble>
              <div className="ml-11">
                <button
                  onClick={handleStartOver}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                >
                  <RotateCcw className="h-3 w-3" />
                  Start Over
                </button>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="container-page max-w-3xl">
          <p className="text-center text-[11px] text-gray-300">
            AI Advisor provides recommendations, not financial advice. Always
            do your own research.
          </p>
        </div>
      </div>
    </div>
  );
}
