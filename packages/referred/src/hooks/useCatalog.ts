import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, CatalogFilters } from '@/types/catalog';

interface UseCatalogReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  setPage: (page: number) => void;
}

const PAGE_SIZE = 12;

export function useCatalog(filters: CatalogFilters): UseCatalogReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Reset page when filters change
  const filterKey = JSON.stringify({
    s: filters.search,
    c: filters.categories,
    r: filters.region,
    pMin: filters.priceMin,
    pMax: filters.priceMax,
    m: filters.modalities,
    b: filters.beginnerFriendly,
    sort: filters.sortBy,
  });

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('products')
          .select('*, company:companies(*)', { count: 'exact' });

        // Region filter
        if (filters.region) {
          query = query.contains('regions', [filters.region]);
        }

        // Modality filter
        if (filters.modalities.length > 0) {
          query = query.in('modality', filters.modalities);
        }

        // Price filters
        if (filters.priceMin !== null) {
          query = query.gte('price_range_low', filters.priceMin);
        }
        if (filters.priceMax !== null) {
          query = query.lte('price_range_high', filters.priceMax);
        }

        // Beginner filter
        if (filters.beginnerFriendly === true) {
          query = query.eq('beginner_friendly', true);
        }

        // Sorting
        switch (filters.sortBy) {
          case 'price_low':
            query = query.order('price_range_low', { ascending: true, nullsFirst: false });
            break;
          case 'price_high':
            query = query.order('price_range_high', { ascending: false, nullsFirst: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          default:
            query = query.order('name', { ascending: true });
        }

        // Pagination
        const from = (page - 1) * PAGE_SIZE;
        query = query.range(from, from + PAGE_SIZE - 1);

        const { data, error: queryError, count } = await query;

        if (cancelled) return;
        if (queryError) throw queryError;

        // Client-side category filter (can't filter on joined fields in Supabase)
        let results = (data || []) as Product[];
        if (filters.categories.length > 0) {
          results = results.filter(
            (p) => p.company && filters.categories.includes(p.company.category)
          );
        }

        setProducts(results);
        setTotalCount(count || 0);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
        setTotalCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [filterKey, page]);

  return {
    products,
    loading,
    error,
    totalCount,
    page,
    pageSize: PAGE_SIZE,
    hasMore: page * PAGE_SIZE < totalCount,
    setPage,
  };
}
