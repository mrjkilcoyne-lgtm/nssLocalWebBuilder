import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  Star,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  Shield,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegionStore } from '@/stores/regionStore';
import RegionToggle from '@/components/RegionToggle';

const sampleProducts = [
  { id: 1, slug: 'cursor-pro', company: 'Cursor', name: 'Cursor Pro', price: '$20/mo', rating: 4.8, credit: 'A+', category: 'Software', badge: 'Editor Pick' },
  { id: 2, slug: 'runpod-h100', company: 'RunPod', name: 'H100 Cloud GPU', price: '$2.49/hr', rating: 4.6, credit: 'A', category: 'Compute', badge: 'Best Value' },
  { id: 3, slug: 'claude-pro', company: 'Anthropic', name: 'Claude Pro', price: '$20/mo', rating: 4.9, credit: 'A+', category: 'Software', badge: 'Top Rated' },
  { id: 4, slug: 'midjourney-pro', company: 'Midjourney', name: 'Midjourney Pro', price: '$30/mo', rating: 4.7, credit: 'A', category: 'Video', badge: null },
  { id: 5, slug: 'elevenlabs-pro', company: 'ElevenLabs', name: 'ElevenLabs Pro', price: '$22/mo', rating: 4.5, credit: 'A-', category: 'Audio', badge: null },
  { id: 6, slug: 'replit-teams', company: 'Replit', name: 'Replit Teams', price: '$25/seat/mo', rating: 4.3, credit: 'B+', category: 'Dev Tools', badge: null },
  { id: 7, slug: 'perplexity-pro', company: 'Perplexity', name: 'Perplexity Pro', price: '$20/mo', rating: 4.6, credit: 'A', category: 'Software', badge: 'Rising' },
  { id: 8, slug: 'openrouter', company: 'OpenRouter', name: 'OpenRouter API', price: 'Pay-per-use', rating: 4.4, credit: 'B+', category: 'Networking', badge: null },
  { id: 9, slug: 'together-ai', company: 'Together AI', name: 'Together Inference', price: '$0.20/M tok', rating: 4.5, credit: 'A-', category: 'Compute', badge: null },
  { id: 10, slug: 'vercel-pro', company: 'Vercel', name: 'Vercel Pro', price: '$20/mo', rating: 4.7, credit: 'A', category: 'Dev Tools', badge: null },
  { id: 11, slug: 'supabase-pro', company: 'Supabase', name: 'Supabase Pro', price: '$25/mo', rating: 4.8, credit: 'A+', category: 'Dev Tools', badge: 'Best Value' },
  { id: 12, slug: 'nvidia-5090', company: 'NVIDIA', name: 'RTX 5090', price: '$1,999', rating: 4.9, credit: 'A+', category: 'Compute', badge: 'Premium' },
];

const categoryFilters = ['All', 'Compute', 'Audio', 'Video', 'Software', 'Networking', 'Dev Tools', 'Financial', 'Home Hubs'];

function CreditBadge({ rating }: { rating: string }) {
  const colors: Record<string, string> = {
    'A+': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'A': 'bg-green-50 text-green-700 border-green-200',
    'A-': 'bg-lime-50 text-lime-700 border-lime-200',
    'B+': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'B': 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold', colors[rating] || 'bg-gray-50 text-gray-600 border-gray-200')}>
      <Shield className="h-2.5 w-2.5" />
      {rating}
    </span>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            'h-3 w-3',
            s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
          )}
        />
      ))}
      <span className="ml-1 text-xs text-gray-400">{value}</span>
    </div>
  );
}

export default function Catalog() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const region = useRegionStore((s) => s.region);

  const filtered = sampleProducts.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-heading">AI Tool Catalog</h1>
        <p className="section-subheading">
          {filtered.length} tools available in {region} region
        </p>
      </div>

      {/* Search + Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools, companies..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-gray-300 hover:text-gray-500" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('rounded-lg border px-3 py-2 text-sm font-medium transition-colors sm:hidden', showFilters ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600')}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            <button onClick={() => setViewMode('grid')} className={cn('rounded-md p-1.5 transition-colors', viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-gray-600')}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('rounded-md p-1.5 transition-colors', viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-gray-600')}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={cn('w-60 shrink-0 space-y-6', showFilters ? 'block' : 'hidden sm:block')}>
          {/* Categories */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Category</h3>
            <div className="space-y-1">
              {categoryFilters.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                    selectedCategory === cat
                      ? 'bg-primary-50 font-medium text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Region</h3>
            <RegionToggle compact />
          </div>

          {/* Price Range */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Price Range</h3>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              <input type="number" placeholder="Max" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>

          {/* Modality */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Modality</h3>
            <div className="relative">
              <select className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option>All modalities</option>
                <option>Text</option>
                <option>Image</option>
                <option>Audio</option>
                <option>Video</option>
                <option>Code</option>
                <option>Multimodal</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Beginner Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="peer sr-only" />
                <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-primary-500" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-gray-600">Beginner-friendly only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className={cn(
            viewMode === 'grid'
              ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-3'
          )}>
            {filtered.map((product) => (
              <div
                key={product.id}
                className={cn(
                  'card group relative',
                  viewMode === 'list' && 'flex items-center gap-4'
                )}
              >
                {product.badge && (
                  <span className="absolute -top-2 right-4 rounded-full bg-primary-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {product.badge}
                  </span>
                )}

                {/* Image placeholder */}
                <div className={cn(
                  'rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center',
                  viewMode === 'grid' ? 'h-32 w-full mb-4' : 'h-16 w-16 shrink-0'
                )}>
                  <span className="text-2xl font-bold text-gray-200">{product.company[0]}</span>
                </div>

                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{product.company}</p>
                  <h3 className="mt-0.5 font-semibold text-primary-900 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <CreditBadge rating={product.credit} />
                    <StarRating value={product.rating} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary-800">{product.price}</span>
                    <Link
                      to={`/product/${product.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md active:scale-95"
                    >
                      Get Deal
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
