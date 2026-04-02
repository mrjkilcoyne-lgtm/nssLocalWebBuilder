import { useState, useEffect, useCallback } from 'react';
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

const DEFAULT_PAGE_SIZE = 12;

export function useCatalog(filters: CatalogFilters): UseCatalogReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // If there's a search query, use the RPC function
      if (filters.search.trim()) {
        const { data, error: rpcError } = await supabase
          .rpc('search_catalog', { search_term: filters.search.trim() });

        if (rpcError) throw rpcError;

        // Apply client-side filters to RPC results then paginate
        let filtered = (data || []) as Product[];
        filtered = applyClientFilters(filtered, filters);
        setTotalCount(filtered.length);

        const start = (page - 1) * pageSize;
        setProducts(filtered.slice(start, start + pageSize));
        setLoading(false);
        return;
      }

      // Build Supabase query
      let query = supabase
        .from('products')
        .select('*, company:companies(*), affiliate_links(*)', { count: 'exact' });

      // Region filter: products whose regions array contains the selected region
      if (filters.region) {
        query = query.contains('regions', [filters.region]);
      }

      // Category filter
      if (filters.categories.length > 0) {
        query = query.in('company.category', filters.categories);
      }

      // Modality filter
      if (filters.modalities.length > 0) {
        query = query.in('modality', filters.modalities);
      }

      // Price range filters
      if (filters.priceMin !== null) {
        query = query.gte('price_range_low', filters.priceMin);
      }
      if (filters.priceMax !== null) {
        query = query.lte('price_range_high', filters.priceMax);
      }

      // Beginner-friendly filter
      if (filters.beginnerFriendly === true) {
        query = query.eq('beginner_friendly', true);
      }

      // Sorting
      switch (filters.sortBy) {
        case 'popular':
          // Products with affiliate links first, then alphabetical
          query = query.order('name', { ascending: true });
          break;
        case 'price_low':
          query = query.order('price_range_low', { ascending: true, nullsFirst: false });
          break;
        case 'price_high':
          query = query.order('price_range_high', { ascending: false, nullsFirst: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'name':
        default:
          query = query.order('name', { ascending: true });
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setProducts((data || []) as Product[]);
      setTotalCount(count || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      setError(message);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    filters.search,
    filters.categories,
    filters.region,
    filters.priceMin,
    filters.priceMax,
    filters.modalities,
    filters.beginnerFriendly,
    filters.sortBy,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    hasMore: page * pageSize < totalCount,
    setPage,
  };
}

/** Apply filters client-side for RPC search results that return flat rows */
function applyClientFilters(products: Product[], filters: CatalogFilters): Product[] {
  return products.filter((p) => {
    if (filters.region && p.regions && !p.regions.includes(filters.region)) return false;
    if (filters.modalities.length > 0 && !filters.modalities.includes(p.modality as any)) return false;
    if (filters.priceMin !== null && (p.price_range_low === null || p.price_range_low < filters.priceMin)) return false;
    if (filters.priceMax !== null && (p.price_range_high === null || p.price_range_high > filters.priceMax)) return false;
    if (filters.beginnerFriendly === true && !p.beginner_friendly) return false;
    if (filters.categories.length > 0 && p.company && !filters.categories.includes(p.company.category)) return false;
    return true;
  });
}
