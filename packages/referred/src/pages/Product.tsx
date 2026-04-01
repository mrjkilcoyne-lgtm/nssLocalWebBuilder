import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Shield,
  ExternalLink,
  ShoppingCart,
  ArrowLeft,
  TrendingUp,
  Heart,
  Share2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const relatedProducts = [
  { slug: 'cursor-pro', company: 'Cursor', name: 'Cursor Pro', price: '$20/mo', rating: 4.8 },
  { slug: 'perplexity-pro', company: 'Perplexity', name: 'Perplexity Pro', price: '$20/mo', rating: 4.6 },
  { slug: 'openrouter', company: 'OpenRouter', name: 'OpenRouter API', price: 'Pay-per-use', rating: 4.4 },
];

const priceHistory = [65, 58, 62, 55, 48, 52, 45, 42, 40, 38, 40, 35];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            'h-4 w-4',
            s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
          )}
        />
      ))}
      <span className="ml-1 text-sm text-gray-500">{value} / 5.0</span>
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Breadcrumb */}
      <Link to="/catalog" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      {/* Product Detail */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left: Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/30 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-primary-300">{(slug || 'P')[0].toUpperCase()}</span>
              </div>
              <p className="text-sm text-primary-400">Product Image</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-300">View {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500 uppercase tracking-wider">Anthropic</p>
              <h1 className="mt-1 text-3xl font-bold text-primary-900 sm:text-4xl">
                {slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Product'}
              </h1>
            </div>
            <button className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:text-primary-500 hover:border-primary-200 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <StarRating value={4.8} />
            <span className="text-sm text-gray-400">|</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              <Shield className="h-3.5 w-3.5" />
              A+ Credit
            </span>
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">
            Industry-leading AI assistant with advanced reasoning, coding capabilities,
            and extended context windows. Perfect for developers, researchers, and
            professionals who need reliable AI-powered workflows.
          </p>

          {/* Features */}
          <div className="mt-6 space-y-2">
            {['200K context window', 'Advanced coding assistance', 'Document analysis', 'Vision capabilities'].map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-primary-500" />
                {feat}
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary-900">$20</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Price last verified 2 hours ago
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex gap-3">
            <button className="btn-primary flex-1 justify-center text-base py-3.5">
              <ExternalLink className="h-4 w-4" />
              Buy Direct
            </button>
            <button className="btn-amber flex-1 justify-center text-base py-3.5">
              <ShoppingCart className="h-4 w-4" />
              Buy on Amazon
            </button>
          </div>
        </div>
      </div>

      {/* Price History */}
      <section className="mt-16">
        <h2 className="section-heading flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary-500" />
          Price History
        </h2>
        <p className="section-subheading">12-month price trend</p>
        <div className="mt-6 card p-6">
          <div className="flex items-end gap-1.5 h-40">
            {priceHistory.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-primary-400 to-primary-300 transition-all duration-300 hover:from-primary-500 hover:to-primary-400"
                style={{ height: `${(val / 70) * 100}%` }}
                title={`$${val}`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>12 months ago</span>
            <span>Today</span>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="mt-16">
        <h2 className="section-heading">Related Products</h2>
        <p className="section-subheading">Tools that work great alongside this one</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {relatedProducts.map((rp) => (
            <Link key={rp.slug} to={`/product/${rp.slug}`} className="card group p-5">
              <div className="h-20 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-gray-200">{rp.company[0]}</span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">{rp.company}</p>
              <h3 className="font-semibold text-primary-900 group-hover:text-primary-600 transition-colors">{rp.name}</h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary-800">{rp.price}</span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-gray-400">{rp.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tip CTA */}
      <section className="mt-16 mb-4">
        <div className="card bg-primary-50/50 border-primary-200/30 p-8 text-center">
          <Heart className="mx-auto h-8 w-8 text-primary-400" />
          <h3 className="mt-3 text-lg font-bold text-primary-900">This research saved you hours</h3>
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
