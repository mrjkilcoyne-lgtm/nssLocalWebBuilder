import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCard from './ProductCard';
import type { Product } from '@/types/catalog';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  totalCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

function SkeletonCard({ viewMode }: { viewMode: 'grid' | 'list' }) {
  return (
    <div
      className={cn(
        'card animate-pulse',
        viewMode === 'list' && 'flex items-center gap-4'
      )}
    >
      <div
        className={cn(
          'rounded-xl bg-gray-100',
          viewMode === 'grid' ? 'h-32 w-full mb-4' : 'h-16 w-16 shrink-0'
        )}
      />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-20 rounded bg-gray-100" />
        <div className="h-4 w-36 rounded bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-5 w-12 rounded bg-gray-100" />
          <div className="h-5 w-24 rounded bg-gray-100" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-7 w-20 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  loading,
  totalCount,
  viewMode,
  onViewModeChange,
}: ProductGridProps) {
  return (
    <div className="flex-1">
      {/* Header bar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{products.length}</span> of{' '}
          <span className="font-medium text-gray-700">{totalCount}</span> products
        </p>
        <div className="flex rounded-lg border border-gray-200 p-0.5">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'grid'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-gray-600'
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'list'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-gray-600'
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-3'
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <LayoutGrid className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No products match your filters</h3>
          <p className="mt-1 text-sm text-gray-400 max-w-sm">
            Try adjusting your search or filter criteria to find what you are looking for.
          </p>
        </div>
      )}

      {/* Product cards */}
      {!loading && products.length > 0 && (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-3'
          )}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
