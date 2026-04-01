import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/catalog';

interface UseSearchReturn {
  results: Product[];
  loading: boolean;
}

export function useSearch(query: string): UseSearchReturn {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .rpc('search_catalog', { search_term: trimmed });

        if (error) throw error;
        setResults((data || []) as Product[]);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  return { results, loading };
}
