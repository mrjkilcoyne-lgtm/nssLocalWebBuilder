import { useRegionStore, type Region } from '@/stores/regionStore';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

const regions: { id: Region; label: string; flag: string }[] = [
  { id: 'US', label: 'US', flag: '🇺🇸' },
  { id: 'EU', label: 'EU', flag: '🇪🇺' },
  { id: 'CN', label: 'CN', flag: '🇨🇳' },
  { id: 'ROW', label: 'ROW', flag: '🌍' },
];

export default function RegionToggle({ compact = false }: { compact?: boolean }) {
  const { region, setRegion } = useRegionStore();

  return (
    <div className="flex items-center gap-2">
      {!compact && <Globe className="h-4 w-4 text-gray-400" />}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
        {regions.map((r) => (
          <button
            key={r.id}
            onClick={() => setRegion(r.id)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
              region === r.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
          >
            <span className="mr-1">{r.flag}</span>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
