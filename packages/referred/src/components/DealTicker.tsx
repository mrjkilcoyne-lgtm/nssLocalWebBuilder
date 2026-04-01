import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const FALLBACK_HEADLINES = [
  'ElevenLabs: 22% recurring commission on all referrals — best in Voice AI',
  'DigitalOcean: $200 free credits + 10% recurring commission',
  'Copy.ai: 45% recurring commission — highest in Content AI',
  'Wise: Lifetime cookie on referrals — best attribution in market',
  'JetBrains: 25% commission, 60-day cookie — all IDEs included',
  'Hetzner: Dedicated servers from EUR3.90/mo — best value in EU hosting',
  'Raspberry Pi 5: Perfect starter for local AI — under $100',
  'Neon Serverless Postgres: Free tier doubled — partner program open',
];

interface TickerItem {
  headline: string;
  link_url: string | null;
}

export default function DealTicker() {
  const [items, setItems] = useState<TickerItem[]>(
    FALLBACK_HEADLINES.map((h) => ({ headline: h, link_url: null }))
  );

  useEffect(() => {
    // Fetch initial ticker items
    supabase
      .from('deal_ticker')
      .select('headline, link_url')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setItems(data);
        }
      });

    // Subscribe to realtime updates
    const channel = supabase
      .channel('deal-ticker-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deal_ticker' },
        () => {
          // Refetch on any change
          supabase
            .from('deal_ticker')
            .select('headline, link_url')
            .eq('is_active', true)
            .order('priority', { ascending: false })
            .then(({ data }) => {
              if (data && data.length > 0) setItems(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-primary-900 text-white">
      <div className="group flex items-center">
        <div className="flex shrink-0 items-center gap-1.5 bg-primary-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider z-10">
          <Zap className="h-3.5 w-3.5" />
          <span>Live Deals</span>
        </div>
        <div className="overflow-hidden">
          <div className="flex animate-ticker-scroll whitespace-nowrap py-1.5 group-hover:[animation-play-state:paused]">
            {[...items, ...items].map((item, i) => (
              <span
                key={i}
                className="mx-6 inline-flex items-center gap-2 text-xs text-primary-100"
              >
                <span className="h-1 w-1 rounded-full bg-primary-400" />
                {item.link_url ? (
                  <a href={item.link_url} className="hover:text-white transition-colors">
                    {item.headline}
                  </a>
                ) : (
                  item.headline
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
