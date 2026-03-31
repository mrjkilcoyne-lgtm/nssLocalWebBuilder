import { useState } from 'react'
import type { Editor as GjsEditor } from 'grapesjs'
import { useProjectStore } from './store/projectStore'
import Dashboard from './components/Dashboard'
import Editor from './components/Editor'
import Toolbar from './components/Toolbar'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'

export default function App() {
  const { view } = useProjectStore()
  const [editor, setEditor] = useState<GjsEditor | null>(null)

  if (view === 'dashboard') {
    return <Dashboard />
  }

  return (
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
  )
}
