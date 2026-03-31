import { useState } from 'react'
import { LayoutGrid, FileText } from 'lucide-react'

type Tab = 'blocks' | 'pages'

export default function LeftPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('blocks')

  return (
    <div className="w-64 bg-surface border-r border-surface-border flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        {([
          { id: 'blocks' as const, label: 'Blocks', icon: LayoutGrid },
          { id: 'pages' as const, label: 'Pages', icon: FileText },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
              activeTab === id
                ? 'text-accent border-b-2 border-accent'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div id="nss-blocks-panel" className={activeTab === 'blocks' ? '' : 'hidden'} />
        <div className={activeTab === 'pages' ? 'p-4' : 'hidden'}>
          <div className="text-neutral-500 text-sm">
            Multi-page support coming soon. Manage your site pages here.
          </div>
        </div>
      </div>
    </div>
  )
}
