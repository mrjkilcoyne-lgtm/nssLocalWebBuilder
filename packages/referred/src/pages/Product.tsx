import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { useProduct } from '@/hooks/useProduct';
import ProductDetail from '@/components/product/ProductDetail';
import AffiliateButtons from '@/components/product/AffiliateButtons';
import PriceHistoryChart from '@/components/product/PriceHistory';
import RelatedProducts from '@/components/product/RelatedProducts';

export default function Product() {
  const { slug } = useParams();
  const { product, company, affiliateLinks, priceHistory, loading, error } = useProduct(slug || '');

  if (loading) {
    return (
      <div className="container-page py-8 sm:py-12">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-page py-8 sm:py-12">
        <Link
          to="/catalog"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Product not found</h2>
          <p className="mt-2 text-sm text-gray-400">
            {error || 'The product you are looking for does not exist or has been removed.'}
          </p>
          <Link to="/catalog" className="btn-primary mt-6">
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Breadcrumb */}
      <Link
        to="/catalog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      {/* Product Detail + CTA Buttons */}
      <ProductDetail product={product} company={company}>
        <AffiliateButtons affiliateLinks={affiliateLinks} />
      </ProductDetail>

      {/* Price History */}
      <PriceHistoryChart priceHistory={priceHistory} currency={product.currency} />

      {/* Related Products */}
      <RelatedProducts
        currentProductId={product.id}
        modality={product.modality}
        companyId={product.company_id}
      />

      {/* Tip CTA */}
      <section className="mt-16 mb-4">
        <div className="card bg-primary-50/50 border-primary-200/30 p-8 text-center">
          <Heart className="mx-auto h-8 w-8 text-primary-400" />
          <h3 className="mt-3 text-lg font-bold text-primary-900">
            This research saved you hours
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Our team tests, verifies pricing, and updates recommendations weekly.
            If this helped, consider leaving a tip.
          </p>
          <Link to="/about" className="btn-primary mt-4 inline-flex">
            Support REFERRED
          </Link>
        </div>
      </section>
    </div>
  );
}
