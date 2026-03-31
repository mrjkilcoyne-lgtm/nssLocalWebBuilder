import { useEffect, useRef, useCallback } from 'react'
import grapesjs, { type Editor as GjsEditor } from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import { nssBlocksPlugin } from '../plugins/nss-blocks'
import { useEditorStore } from '../store/editorStore'
import { useProjectStore } from '../store/projectStore'
import { saveProject } from '../utils/db'

interface EditorProps {
  onEditorReady: (editor: GjsEditor) => void
}

export default function Editor({ onEditorReady }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const gjsRef = useRef<GjsEditor | null>(null)
  const { setSaving, setLastSaved } = useEditorStore()
  const { currentProject, updateProject } = useProjectStore()

  const handleSave = useCallback(async () => {
    if (!gjsRef.current || !currentProject) return
    setSaving(true)
    try {
      const data = JSON.stringify(gjsRef.current.getProjectData())
      updateProject(currentProject.id, { editorData: data })
      await saveProject({
        ...currentProject,
        editorData: data,
        updatedAt: new Date(),
      })
      setLastSaved(new Date())
    } finally {
      setSaving(false)
    }
  }, [currentProject, setSaving, setLastSaved, updateProject])

  useEffect(() => {
    if (!editorRef.current || gjsRef.current) return

    const editor = grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: 'auto',
      storageManager: false,
      undoManager: { trackSelection: false },
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        ],
      },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px', widthMedia: '992px' },
          { name: 'Mobile', width: '375px', widthMedia: '480px' },
        ],
      },
      panels: { defaults: [] },
      blockManager: { appendTo: '#nss-blocks-panel' },
      styleManager: {
        appendTo: '#nss-styles-panel',
        sectors: [
          {
            name: 'Layout',
            open: true,
            properties: [
              'display', 'flex-direction', 'justify-content', 'align-items',
              'flex-wrap', 'gap',
            ],
          },
          {
            name: 'Spacing',
            open: false,
            properties: [
              'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
              'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            ],
          },
          {
            name: 'Size',
            open: false,
            properties: [
              'width', 'min-width', 'max-width',
              'height', 'min-height', 'max-height',
            ],
          },
          {
            name: 'Typography',
            open: false,
            properties: [
              'font-family', 'font-size', 'font-weight', 'line-height',
              'letter-spacing', 'text-align', 'color', 'text-decoration',
            ],
          },
          {
            name: 'Background',
            open: false,
            properties: ['background-color', 'background-image', 'background-size', 'background-position'],
          },
          {
            name: 'Border',
            open: false,
            properties: [
              'border-radius', 'border-width', 'border-style', 'border-color',
              'box-shadow',
            ],
          },
          {
            name: 'Position',
            open: false,
            properties: ['position', 'top', 'right', 'bottom', 'left', 'z-index', 'overflow'],
          },
        ],
      },
      layerManager: { appendTo: '#nss-layers-panel' },
      traitManager: { appendTo: '#nss-settings-panel' },
      plugins: [nssBlocksPlugin],
    })

    // Load existing project data
    if (currentProject?.editorData) {
      try {
        editor.loadProjectData(JSON.parse(currentProject.editorData))
      } catch {
        // Start fresh if data is corrupted
      }
    }

    // Auto-save on change (debounced)
    let saveTimeout: ReturnType<typeof setTimeout>
    editor.on('change:changesCount', () => {
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(handleSave, 2000)
    })

    // Keyboard shortcuts
    editor.on('run:core:undo', () => editor.UndoManager.undo())
    editor.on('run:core:redo', () => editor.UndoManager.redo())

    gjsRef.current = editor
    onEditorReady(editor)

    return () => {
      clearTimeout(saveTimeout)
      editor.destroy()
      gjsRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={editorRef} className="h-full w-full" />
}
