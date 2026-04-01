import { useState } from 'react'
import type { Editor as GjsEditor } from 'grapesjs'
import { useProjectStore } from './store/projectStore'
import { useAiStore } from './store/aiStore'
import Dashboard from './components/Dashboard'
import Editor from './components/Editor'
import Toolbar from './components/Toolbar'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import Moneypenny from './components/Moneypenny'
import SettingsModal from './components/SettingsModal'

export default function App() {
  const { view } = useProjectStore()
  const showSettings = useAiStore((s) => s.showSettings)
  const [editor, setEditor] = useState<GjsEditor | null>(null)

  return (
    <>
      {view === 'dashboard' ? (
        <Dashboard />
      ) : (
        <div className="h-screen flex flex-col bg-surface-dark">
          <Toolbar editor={editor} />
          <div className="flex flex-1 min-h-0">
            <LeftPanel />
            <div className="flex-1 min-w-0">
              <Editor onEditorReady={setEditor} />
            </div>
            <RightPanel />
          </div>
        </div>
      )}

      {/* Moneypenny is always present */}
      <Moneypenny />

      {/* Settings modal */}
      {showSettings && <SettingsModal />}
    </>
  )
}
