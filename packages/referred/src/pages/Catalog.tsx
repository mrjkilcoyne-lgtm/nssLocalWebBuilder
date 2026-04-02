import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegionStore } from '@/stores/regionStore';
import { useCatalog } from '@/hooks/useCatalog';
import SearchBar from '@/components/catalog/SearchBar';
import FilterSidebar from '@/components/catalog/FilterSidebar';
import ProductGrid from '@/components/catalog/ProductGrid';
import type { CatalogFilters, Region } from '@/types/catalog';

const DEFAULT_FILTERS: CatalogFilters = {
  search: '',
  categories: [],
  region: 'US',
  priceMin: null,
  priceMax: null,
  modalities: [],
  beginnerFriendly: null,
  sortBy: 'name',
};

export default function Catalog() {
  const region = useRegionStore((s) => s.region) as Region;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>({
    ...DEFAULT_FILTERS,
    region,
  });

  // Keep region in sync with store
  const effectiveFilters: CatalogFilters = { ...filters, region };

  const { products, loading, error, totalCount, page, pageSize, hasMore, setPage } = useCatalog(effectiveFilters);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function handleFilterChange(partial: Partial<CatalogFilters>) {
    setFilters((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-heading">AI Tool Catalog</h1>
        <p className="section-subheading">
          {totalCount} tools available in {region} region
        </p>
      </div>

      {/* Search + Sort toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={filters.search}
          onChange={(search) => handleFilterChange({ search })}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm font-medium transition-colors sm:hidden',
              showFilters
                ? 'border-primary-300 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-600'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as CatalogFilters['sortBy'] })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="name">Name: A to Z</option>
            <option value="popular">Most Popular</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar */}
        <FilterSidebar
          filters={effectiveFilters}
          onChange={handleFilterChange}
          visible={showFilters}
        />

        {/* Product Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          totalCount={totalCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Pagination */}
      {totalCount > 0 && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setPage(page - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page <= 1}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              page <= 1
                ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page <span className="font-medium text-gray-700">{page}</span> of{' '}
            <span className="font-medium text-gray-700">{totalPages}</span>
          </span>
          <button
            onClick={() => {
              setPage(page + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={!hasMore}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              !hasMore
                ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
