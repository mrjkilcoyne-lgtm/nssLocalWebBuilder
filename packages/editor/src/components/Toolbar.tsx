import type { Editor } from 'grapesjs'
import { useEditorStore } from '../store/editorStore'
import { useProjectStore } from '../store/projectStore'
import {
  Monitor, Tablet, Smartphone, Eye, Undo2, Redo2,
  Save, Download, ArrowLeft, Code, Settings,
} from 'lucide-react'
import { useAiStore } from '../store/aiStore'

interface ToolbarProps {
  editor: Editor | null
}

export default function Toolbar({ editor }: ToolbarProps) {
  const { deviceMode, setDeviceMode, isPreviewMode, setPreviewMode, isSaving, lastSaved } = useEditorStore()
  const { currentProject, setView } = useProjectStore()
  const setShowSettings = useAiStore((s) => s.setShowSettings)

  const handleDevice = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setDeviceMode(mode)
    if (!editor) return
    const deviceMap = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' }
    editor.setDevice(deviceMap[mode])
  }

  const handleUndo = () => editor?.UndoManager.undo()
  const handleRedo = () => editor?.UndoManager.redo()

  const handlePreview = () => {
    if (!editor) return
    if (isPreviewMode) {
      editor.stopCommand('preview')
    } else {
      editor.runCommand('preview')
    }
    setPreviewMode(!isPreviewMode)
  }

  const handleExport = () => {
    if (!editor) return
    const html = editor.getHtml()
    const css = editor.getCss()
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentProject?.name || 'My Site'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    ${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProject?.name || 'site'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleViewCode = () => {
    if (!editor) return
    const html = editor.getHtml()
    const css = editor.getCss()
    const modal = editor.Modal
    modal.setTitle('Source Code')
    modal.setContent(`
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 16px; max-height: 60vh; overflow: auto; font-family: monospace; font-size: 13px;">
        <div>
          <h3 style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3b82f6;">HTML</h3>
          <pre style="background: #0a0a0a; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow: auto; max-height: 300px; white-space: pre-wrap;">${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
        <div>
          <h3 style="margin-bottom: 8px; font-family: Inter, sans-serif; font-size: 14px; color: #3b82f6;">CSS</h3>
          <pre style="background: #0a0a0a; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow: auto; max-height: 300px; white-space: pre-wrap;">${css}</pre>
        </div>
      </div>
    `)
    modal.open()
  }

  const timeAgo = lastSaved
    ? `Saved ${Math.round((Date.now() - lastSaved.getTime()) / 1000)}s ago`
    : 'Not saved'

  return (
    <div className="flex items-center justify-between h-12 px-4 bg-surface border-b border-surface-border">
      {/* Left: Back + Project name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('dashboard')}
          className="p-1.5 rounded hover:bg-surface-hover text-neutral-400 hover:text-white transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-medium text-white truncate max-w-[200px]">
          {currentProject?.name || 'Untitled'}
        </span>
        <span className="text-xs text-neutral-500">
          {isSaving ? 'Saving...' : timeAgo}
        </span>
      </div>

      {/* Center: Device + Undo/Redo */}
      <div className="flex items-center gap-1">
        <div className="flex items-center bg-surface-dark rounded-lg p-0.5 mr-2">
          {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(
            ([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => handleDevice(mode)}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceMode === mode
                    ? 'bg-accent/10 text-accent'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              >
                <Icon size={16} />
              </button>
            )
          )}
        </div>

        <button onClick={handleUndo} className="p-1.5 rounded hover:bg-surface-hover text-neutral-400 hover:text-white" title="Undo">
          <Undo2 size={16} />
        </button>
        <button onClick={handleRedo} className="p-1.5 rounded hover:bg-surface-hover text-neutral-400 hover:text-white" title="Redo">
          <Redo2 size={16} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button onClick={handleViewCode} className="p-1.5 rounded hover:bg-surface-hover text-neutral-400 hover:text-white" title="View Source">
          <Code size={16} />
        </button>
        <button onClick={handlePreview} className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${isPreviewMode ? 'text-accent' : 'text-neutral-400 hover:text-white'}`} title="Preview">
          <Eye size={16} />
        </button>
        <button onClick={() => editor && editor.store()} className="p-1.5 rounded hover:bg-surface-hover text-neutral-400 hover:text-white" title="Save">
          <Save size={16} />
        </button>
        <button onClick={() => setShowSettings(true)} className="p-1.5 rounded hover:bg-surface-hover text-neutral-400 hover:text-white" title="Settings">
          <Settings size={16} />
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </div>
  )
}
