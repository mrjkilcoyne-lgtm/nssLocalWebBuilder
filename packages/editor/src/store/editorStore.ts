import { create } from 'zustand'

type RightPanel = 'styles' | 'layers' | 'settings' | 'seo' | 'ai'

interface EditorState {
  activeRightPanel: RightPanel
  isPreviewMode: boolean
  deviceMode: 'desktop' | 'tablet' | 'mobile'
  isSaving: boolean
  lastSaved: Date | null

  setActiveRightPanel: (panel: RightPanel) => void
  setPreviewMode: (preview: boolean) => void
  setDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void
  setSaving: (saving: boolean) => void
  setLastSaved: (date: Date) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  activeRightPanel: 'styles',
  isPreviewMode: false,
  deviceMode: 'desktop',
  isSaving: false,
  lastSaved: null,

  setActiveRightPanel: (panel) => set({ activeRightPanel: panel }),
  setPreviewMode: (preview) => set({ isPreviewMode: preview }),
  setDeviceMode: (mode) => set({ deviceMode: mode }),
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSaved: date }),
}))
