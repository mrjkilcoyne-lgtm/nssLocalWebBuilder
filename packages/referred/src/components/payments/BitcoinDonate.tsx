import { useState } from 'react';
import { Bitcoin, Copy, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const BTC_ADDRESS = 'bc1qreferred000000000000000000000';
const LIGHTNING_URL = 'lnurl1dp68gurn8ghj7mrww4exctt5dahkccn00qhxget8wfjk2um0veax2un09e3k7mf0w5lhz0t9xcekzv34xsunwd3hxqurzepexejxxdpnxf6';

interface BitcoinDonateProps {
  className?: string;
  compact?: boolean;
}

/**
 * Minimal QR code SVG for the BTC address.
 * Uses a simple visual placeholder pattern since generating a real
 * QR code without a library would be very large. In production,
 * replace with a proper QR library or a pre-generated SVG.
 */
function QRPlaceholder({ value }: { value: string }) {
  // Create a deterministic pattern from the address for visual variety
  const cells: boolean[][] = [];
  const size = 21;
  for (let y = 0; y < size; y++) {
    cells[y] = [];
    for (let x = 0; x < size; x++) {
      // Finder patterns (top-left, top-right, bottom-left)
      const inFinderTL = x < 7 && y < 7;
      const inFinderTR = x >= size - 7 && y < 7;
      const inFinderBL = x < 7 && y >= size - 7;
      if (inFinderTL || inFinderTR || inFinderBL) {
        const fx = inFinderTR ? x - (size - 7) : x;
        const fy = inFinderBL ? y - (size - 7) : y;
        const border = fx === 0 || fx === 6 || fy === 0 || fy === 6;
        const inner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
        cells[y][x] = border || inner;
      } else {
        const charCode = value.charCodeAt((x * 3 + y * 7) % value.length) || 0;
        cells[y][x] = (charCode + x * y) % 3 === 0;
      }
    }
  }

  const cellSize = 4;
  const svgSize = size * cellSize;

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      className="rounded-lg"
      role="img"
      aria-label={`QR code for Bitcoin address ${value}`}
    >
      <rect width={svgSize} height={svgSize} fill="white" />
      {cells.map((row, y) =>
        row.map(
          (filled, x) =>
            filled && (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1e293b"
              />
            )
        )
      )}
    </svg>
  );
}

export default function BitcoinDonate({ className, compact }: BitcoinDonateProps) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(BTC_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  }

  return (
    <div
      className={cn(
        'card overflow-hidden border border-gray-100',
        className
      )}
    >
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-500/20">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-primary-900">Donate with Bitcoin</h3>
            <p className="text-xs text-gray-500">
              BTC and Lightning Network accepted
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* QR Code */}
        {!compact && (
          <div className="mb-4 flex justify-center">
            <div className="rounded-xl border border-gray-100 bg-white p-3">
              <QRPlaceholder value={BTC_ADDRESS} />
            </div>
          </div>
        )}

        {/* BTC Address */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Bitcoin Address
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 font-mono">
              {BTC_ADDRESS}
            </code>
            <button
              onClick={copyAddress}
              aria-label={copied ? 'Address copied' : 'Copy Bitcoin address'}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-150',
                copied
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Lightning Network */}
        <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
            <Zap className="h-4 w-4" />
            Lightning Network
          </div>
          <p className="mt-1 truncate text-xs text-amber-600/80 font-mono">
            {LIGHTNING_URL}
          </p>
        </div>
      </div>
    </div>
  );
}
