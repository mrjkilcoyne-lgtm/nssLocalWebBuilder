import { Zap } from 'lucide-react';

const headlines = [
  'RunPod drops GPU prices 20% for H100 instances',
  'Anthropic Claude 4 now available on all plans',
  'Hugging Face Pro: 50% off annual subscriptions',
  'NVIDIA RTX 5090 in stock at MSRP — limited time',
  'Perplexity Pro: $1 trial for new users this week',
  'Replit Teams: free tier expanded to 10 collaborators',
  'Midjourney V7 early access included with Pro plan',
  'AWS credits: $1000 free for AI startups',
  'Cursor Pro 40% off annual — best IDE deal this quarter',
  'OpenRouter adds 15 new models with volume discounts',
];

export default function DealTicker() {
  return (
    <div className="relative overflow-hidden bg-primary-900 text-white">
      <div className="group flex items-center">
        <div className="flex shrink-0 items-center gap-1.5 bg-primary-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider z-10">
          <Zap className="h-3.5 w-3.5" />
          <span>Live Deals</span>
        </div>
        <div className="overflow-hidden">
          <div className="flex animate-ticker-scroll whitespace-nowrap py-1.5 group-hover:[animation-play-state:paused]">
            {[...headlines, ...headlines].map((headline, i) => (
              <span
                key={i}
                className="mx-6 inline-flex items-center gap-2 text-xs text-primary-100"
              >
                <span className="h-1 w-1 rounded-full bg-primary-400" />
                {headline}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
