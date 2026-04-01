import { ExternalLink, ShoppingCart } from 'lucide-react';
import type { AffiliateLink } from '@/types/catalog';

interface AffiliateButtonsProps {
  affiliateLinks: AffiliateLink[];
}

export default function AffiliateButtons({ affiliateLinks }: AffiliateButtonsProps) {
  const directLink = affiliateLinks.find((l) => l.link_type === 'direct' || !l.amazon_url);
  const amazonLink = affiliateLinks.find((l) => l.amazon_url);

  function trackClick(type: string, url: string) {
    console.log(`[REFERRED] Affiliate click: ${type}`, { url, timestamp: new Date().toISOString() });
  }

  return (
    <div className="mt-6 flex gap-3">
      {directLink && (
        <a
          href={directLink.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick('direct', directLink.url)}
          className="btn-primary flex-1 justify-center text-base py-3.5"
        >
          <ExternalLink className="h-4 w-4" />
          Buy Direct
        </a>
      )}

      {amazonLink?.amazon_url && (
        <a
          href={amazonLink.amazon_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick('amazon', amazonLink.amazon_url!)}
          className="btn-amber flex-1 justify-center text-base py-3.5"
        >
          <ShoppingCart className="h-4 w-4" />
          Buy on Amazon
        </a>
      )}

      {/* Fallback if no links loaded yet */}
      {affiliateLinks.length === 0 && (
        <>
          <button
            disabled
            className="btn-primary flex-1 justify-center text-base py-3.5 opacity-50 cursor-not-allowed"
          >
            <ExternalLink className="h-4 w-4" />
            Buy Direct
          </button>
        </>
      )}
    </div>
  );
}
