import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Company, AffiliateLink, PriceHistory } from '@/types/catalog';

interface UseProductReturn {
  product: Product | null;
  company: Company | null;
  affiliateLinks: AffiliateLink[];
  priceHistory: PriceHistory[];
  loading: boolean;
  error: string | null;
}

export function useProduct(slug: string): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      try {
        // Fetch product with company join
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*, company:companies(*)')
          .eq('slug', slug)
          .single();

        if (productError) throw productError;
        if (!productData) throw new Error('Product not found');

        if (cancelled) return;

        const prod = productData as Product;
        setProduct(prod);
        setCompany(prod.company || null);

        // Fetch affiliate links and price history in parallel
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const [linksResult, historyResult] = await Promise.all([
          supabase
            .from('affiliate_links')
            .select('*')
            .eq('product_id', prod.id)
            .eq('status', 'active'),
          supabase
            .from('price_history')
            .select('*')
            .eq('product_id', prod.id)
            .gte('recorded_at', sixMonthsAgo.toISOString())
            .order('recorded_at', { ascending: true }),
        ]);

        if (cancelled) return;

        if (linksResult.error) throw linksResult.error;
        if (historyResult.error) throw historyResult.error;

        setAffiliateLinks((linksResult.data || []) as AffiliateLink[]);
        setPriceHistory((historyResult.data || []) as PriceHistory[]);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load product';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();
    return () => { cancelled = true; };
  }, [slug]);

  return { product, company, affiliateLinks, priceHistory, loading, error };
}
