import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import RegionToggle from '@/components/RegionToggle';
import type { CatalogFilters, Modality } from '@/types/catalog';

const CATEGORIES = [
  'AI Platforms',
  'AI Software',
  'Cloud/Infra',
  'Hardware-Compute',
  'Hardware-Audio',
  'Hardware-Video',
  'Hardware-Hubs',
  'Hardware-Networking',
  'Hardware-Speakers',
  'Financial',
  'Dev Tools',
];

const MODALITIES: { value: Modality; label: string }[] = [
  { value: 'compute', label: 'Compute' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'networking', label: 'Networking' },
  { value: 'storage', label: 'Storage' },
  { value: 'software', label: 'Software' },
  { value: 'financial', label: 'Financial' },
  { value: 'hub', label: 'Hub' },
];

interface FilterSidebarProps {
  filters: CatalogFilters;
  onChange: (filters: Partial<CatalogFilters>) => void;
  visible: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="mb-3 flex w-full items-center justify-between"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && children}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, visible }: FilterSidebarProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.modalities.length > 0 ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.beginnerFriendly === true;

  function handleCategoryToggle(cat: string) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ categories: next });
  }

  function handleModalityToggle(mod: Modality) {
    const next = filters.modalities.includes(mod)
      ? filters.modalities.filter((m) => m !== mod)
      : [...filters.modalities, mod];
    onChange({ modalities: next });
  }

  function clearAll() {
    onChange({
      categories: [],
      modalities: [],
      priceMin: null,
      priceMax: null,
      beginnerFriendly: null,
    });
  }

  return (
    <aside
      className={cn(
        'w-60 shrink-0 space-y-6',
        visible ? 'block' : 'hidden sm:block'
      )}
    >
      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear all filters
        </button>
      )}

      {/* Categories */}
      <CollapsibleSection title="Category">
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500/20"
              />
              <span
                className={cn(
                  'text-gray-600',
                  filters.categories.includes(cat) && 'font-medium text-primary-700'
                )}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Region */}
      <CollapsibleSection title="Region">
        <RegionToggle compact />
      </CollapsibleSection>

      {/* Price Range */}
      <CollapsibleSection title="Price Range">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin ?? ''}
            onChange={(e) =>
              onChange({ priceMin: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax ?? ''}
            onChange={(e) =>
              onChange({ priceMax: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </CollapsibleSection>

      {/* Modality */}
      <CollapsibleSection title="Modality">
        <div className="space-y-1">
          {MODALITIES.map((mod) => (
            <label
              key={mod.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={filters.modalities.includes(mod.value)}
                onChange={() => handleModalityToggle(mod.value)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500/20"
              />
              <span
                className={cn(
                  'text-gray-600',
                  filters.modalities.includes(mod.value) && 'font-medium text-primary-700'
                )}
              >
                {mod.label}
              </span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Beginner-friendly toggle */}
      <CollapsibleSection title="Experience Level">
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.beginnerFriendly === true}
              onChange={(e) =>
                onChange({ beginnerFriendly: e.target.checked ? true : null })
              }
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-primary-500" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-gray-600">Beginner-friendly only</span>
        </label>
      </CollapsibleSection>
    </aside>
  );
}
