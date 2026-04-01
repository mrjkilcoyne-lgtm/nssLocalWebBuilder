import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/catalog/ProductCard';
import type { Product } from '@/types/catalog';

interface RelatedProductsProps {
  currentProductId: string;
  modality: string;
  companyId: string;
}

export default function RelatedProducts({
  currentProductId,
  modality,
  companyId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!currentProductId) return;

    async function fetchRelated() {
      // Try same modality first, then same company
      const { data: modalityData } = await supabase
        .from('products')
        .select('*, company:companies(*)')
        .eq('modality', modality)
        .neq('id', currentProductId)
        .limit(3);

      let results = (modalityData || []) as Product[];

      // If not enough, fill with same company products
      if (results.length < 3) {
        const existingIds = [currentProductId, ...results.map((p) => p.id)];
        const { data: companyData } = await supabase
          .from('products')
          .select('*, company:companies(*)')
          .eq('company_id', companyId)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .limit(3 - results.length);

        results = [...results, ...((companyData || []) as Product[])];
      }

      setProducts(results.slice(0, 3));
    }

    fetchRelated();
  }, [currentProductId, modality, companyId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="section-heading">Related Products</h2>
      <p className="section-subheading">Tools that work great alongside this one</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
