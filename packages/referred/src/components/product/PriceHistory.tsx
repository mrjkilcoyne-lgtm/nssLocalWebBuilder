import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PriceHistory as PriceHistoryType } from '@/types/catalog';

interface PriceHistoryProps {
  priceHistory: PriceHistoryType[];
  currency: string;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function PriceHistoryChart({ priceHistory, currency }: PriceHistoryProps) {
  if (priceHistory.length === 0) {
    return (
      <section className="mt-16">
        <h2 className="section-heading flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary-500" />
          Price History
        </h2>
        <p className="section-subheading">No price history available yet</p>
      </section>
    );
  }

  const prices = priceHistory.map((p) => p.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;

  const currentPrice = prices[prices.length - 1];
  const oldestPrice = prices[0];
  const priceDiff = currentPrice - oldestPrice;
  const pctChange = oldestPrice > 0 ? ((priceDiff / oldestPrice) * 100) : 0;
  const priceDown = priceDiff < 0;

  // SVG chart dimensions
  const chartWidth = 600;
  const chartHeight = 160;
  const padding = { top: 10, right: 10, bottom: 30, left: 10 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Generate SVG path points
  const points = priceHistory.map((entry, i) => {
    const x = padding.left + (i / Math.max(priceHistory.length - 1, 1)) * plotWidth;
    const y = padding.top + plotHeight - ((entry.price - minPrice) / range) * plotHeight;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Area fill path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;

  // X-axis labels: show first, middle, last
  const labelIndices = [0, Math.floor(priceHistory.length / 2), priceHistory.length - 1];

  return (
    <section className="mt-16">
      <h2 className="section-heading flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary-500" />
        Price History
      </h2>
      <p className="section-subheading">6-month price trend</p>

      {/* Savings badge */}
      <div className="mt-4 mb-2">
        {Math.abs(pctChange) > 0.5 && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
              priceDown
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            )}
          >
            {priceDown ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            {priceDown
              ? `You'd save ${Math.abs(pctChange).toFixed(1)}%`
              : `Prices up ${pctChange.toFixed(1)}%`}
          </span>
        )}
      </div>

      <div className="card p-6">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-primary-400))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(var(--color-primary-400))" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#priceGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="rgb(var(--color-primary-500))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="white"
              stroke="rgb(var(--color-primary-500))"
              strokeWidth="2"
            >
              <title>
                {formatDate(priceHistory[i].recorded_at)}: {formatCurrency(priceHistory[i].price, currency)}
              </title>
            </circle>
          ))}

          {/* X-axis labels */}
          {labelIndices.map((idx) => (
            <text
              key={idx}
              x={points[idx]?.x || 0}
              y={chartHeight - 5}
              textAnchor="middle"
              className="fill-gray-400 text-[11px]"
            >
              {formatDate(priceHistory[idx].recorded_at)}
            </text>
          ))}
        </svg>

        {/* Price summary */}
        <div className="mt-4 flex justify-between text-sm">
          <div>
            <p className="text-gray-400">6 months ago</p>
            <p className="font-semibold text-gray-700">
              {formatCurrency(oldestPrice, currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Current</p>
            <p className="font-semibold text-primary-700">
              {formatCurrency(currentPrice, currency)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
