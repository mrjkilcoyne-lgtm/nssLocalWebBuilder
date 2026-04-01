import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckSquare,
  Square,
  ArrowRightLeft,
  ShoppingCart,
  Share2,
  Download,
  Gauge,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StackItem {
  id: number;
  name: string;
  company: string;
  price: number;
  selected: boolean;
  category: string;
}

const initialStack: StackItem[] = [
  { id: 1, name: 'Cursor Pro', company: 'Cursor', price: 20, selected: true, category: 'IDE' },
  { id: 2, name: 'Claude Pro', company: 'Anthropic', price: 20, selected: true, category: 'AI Assistant' },
  { id: 3, name: 'RunPod H100', company: 'RunPod', price: 45, selected: true, category: 'Compute' },
  { id: 4, name: 'Supabase Pro', company: 'Supabase', price: 25, selected: true, category: 'Database' },
  { id: 5, name: 'Vercel Pro', company: 'Vercel', price: 20, selected: false, category: 'Hosting' },
  { id: 6, name: 'ElevenLabs Pro', company: 'ElevenLabs', price: 22, selected: false, category: 'Audio' },
];

const skillLevels = [
  { level: 1, label: 'N00b', color: 'bg-red-400' },
  { level: 2, label: '', color: 'bg-red-300' },
  { level: 3, label: 'Beginner', color: 'bg-orange-400' },
  { level: 4, label: '', color: 'bg-orange-300' },
  { level: 5, label: 'Intermediate', color: 'bg-yellow-400' },
  { level: 6, label: '', color: 'bg-yellow-300' },
  { level: 7, label: 'Advanced', color: 'bg-lime-400' },
  { level: 8, label: '', color: 'bg-green-400' },
  { level: 9, label: 'Expert', color: 'bg-emerald-400' },
  { level: 10, label: 'Pro', color: 'bg-primary-500' },
];

export default function Stack() {
  const { id } = useParams();
  const [items, setItems] = useState(initialStack);
  const userLevel = 6;

  const toggleItem = (itemId: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectedItems = items.filter((i) => i.selected);
  const total = selectedItems.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="container-page py-8 sm:py-12">
      <Link to="/advisor" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Advisor
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-500" />
            <h1 className="section-heading">Your AI Stack</h1>
          </div>
          <p className="section-subheading">Stack #{id || '1'} — Personalized recommendation</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-gray-200 p-2.5 text-gray-400 hover:text-primary-500 hover:border-primary-200 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="rounded-lg border border-gray-200 p-2.5 text-gray-400 hover:text-primary-500 hover:border-primary-200 transition-colors">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Stack Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'card flex items-center gap-4 p-4 cursor-pointer transition-all',
                item.selected
                  ? 'border-primary-200 bg-primary-50/30 shadow-sm'
                  : 'opacity-60 hover:opacity-80'
              )}
              onClick={() => toggleItem(item.id)}
            >
              {item.selected ? (
                <CheckSquare className="h-5 w-5 shrink-0 text-primary-500" />
              ) : (
                <Square className="h-5 w-5 shrink-0 text-gray-300" />
              )}

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-sm font-bold text-gray-300">{item.company[0]}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary-900 truncate">{item.name}</h3>
                  <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{item.company}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-primary-800">${item.price}/mo</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-400 hover:text-primary-500 hover:border-primary-200 transition-colors"
                title="Swap alternative"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar: Total + Gauge */}
        <div className="space-y-6">
          {/* Running Total */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Monthly Total</h3>
            <p className="mt-2 text-4xl font-bold text-primary-900">${total}</p>
            <p className="mt-1 text-sm text-gray-400">{selectedItems.length} of {items.length} tools selected</p>
            <button className="btn-amber w-full mt-5 justify-center">
              <ShoppingCart className="h-4 w-4" />
              Buy All on Amazon
            </button>
          </div>

          {/* Skill Gauge */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-5 w-5 text-primary-500" />
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">N00b-to-Pro Gauge</h3>
            </div>
            <div className="flex gap-1">
              {skillLevels.map((sl) => (
                <div key={sl.level} className="flex-1 space-y-1">
                  <div
                    className={cn(
                      'h-8 rounded-sm transition-all',
                      sl.level <= userLevel ? sl.color : 'bg-gray-100',
                      sl.level === userLevel && 'ring-2 ring-offset-1 ring-primary-400'
                    )}
                  />
                  {sl.label && (
                    <p className={cn(
                      'text-[9px] text-center leading-tight',
                      sl.level <= userLevel ? 'text-gray-600 font-medium' : 'text-gray-300'
                    )}>
                      {sl.label}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-sm text-gray-500">
              Your level: <span className="font-semibold text-primary-700">Intermediate</span>
            </p>
            <p className="mt-1 text-center text-xs text-gray-400">
              This stack will take you to Advanced in ~3 months
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="btn-secondary flex-1 justify-center text-sm py-2.5">
              <Share2 className="h-4 w-4" />
              Share Stack
            </button>
            <button className="btn-secondary flex-1 justify-center text-sm py-2.5">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
