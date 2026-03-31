import { useEditorStore } from '../store/editorStore'
import { Paintbrush, Layers, Settings, Search, Sparkles } from 'lucide-react'

const tabs = [
  { id: 'styles' as const, label: 'Styles', icon: Paintbrush },
  { id: 'layers' as const, label: 'Layers', icon: Layers },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
  { id: 'seo' as const, label: 'SEO', icon: Search },
  { id: 'ai' as const, label: 'AI', icon: Sparkles },
]

export default function RightPanel() {
  const { activeRightPanel, setActiveRightPanel } = useEditorStore()

  return (
    <div className="w-72 bg-surface border-l border-surface-border flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveRightPanel(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
              activeRightPanel === id
                ? 'text-accent border-b-2 border-accent'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title={label}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-auto">
        <div id="nss-styles-panel" className={activeRightPanel === 'styles' ? '' : 'hidden'} />
        <div id="nss-layers-panel" className={activeRightPanel === 'layers' ? '' : 'hidden'} />
        <div id="nss-settings-panel" className={activeRightPanel === 'settings' ? '' : 'hidden'} />
        <div id="nss-seo-panel" className={activeRightPanel === 'seo' ? '' : 'hidden'}>
          <div className="p-4 text-neutral-500 text-sm">
            SEO panel coming soon. Configure meta tags, Open Graph, and structured data here.
          </div>
        </div>
        <div id="nss-ai-panel" className={activeRightPanel === 'ai' ? '' : 'hidden'}>
          <div className="p-4 text-neutral-500 text-sm">
            AI co-pilot coming soon. Get content suggestions, accessibility checks, and layout advice.
          </div>
        </div>
      </div>
    </div>
  )
}
