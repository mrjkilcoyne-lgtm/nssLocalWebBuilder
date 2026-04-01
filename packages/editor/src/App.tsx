import { useState, useEffect, useCallback } from 'react'
import type { Editor as GjsEditor } from 'grapesjs'
import { useProjectStore } from './store/projectStore'
import { useAiStore } from './store/aiStore'
import { useChatStore } from './store/chatStore'
import { useAiPersistence } from './hooks/useAiPersistence'
import { loadAppState, saveAppState } from './utils/db'
import Dashboard from './components/Dashboard'
import Editor from './components/Editor'
import Toolbar from './components/Toolbar'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import Moneypenny from './components/Moneypenny'
import SettingsModal from './components/SettingsModal'
import Onboarding from './components/Onboarding'

export default function App() {
  useAiPersistence()

  const { view } = useProjectStore()
  const showSettings = useAiStore((s) => s.showSettings)
  const [editor, setEditor] = useState<GjsEditor | null>(null)

  // Onboarding state: null = loading, true = show, false = done
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)

  useEffect(() => {
    loadAppState().then((state) => {
      setShowOnboarding(!state?.onboardingComplete)
    })
  }, [])

  const handleOnboardingChoice = useCallback(
    (choice: 'tour' | 'build' | 'import') => {
      saveAppState({ onboardingComplete: true })
      setShowOnboarding(false)

      if (choice === 'tour') {
        // Expand Moneypenny and send tour messages
        const chat = useChatStore.getState()
        chat.setExpanded(true)
        chat.addMessage({
          id: Math.random().toString(36).substring(2, 10),
          role: 'assistant',
          content:
            'Welcome. Let me show you around.\n\n' +
            '1. The canvas in the centre is your website. Drag components from the left panel to build pages.\n' +
            '2. The right panel shows style and layout controls for the selected element.\n' +
            '3. I\'m here in this chat. Ask me to write copy, adjust design, generate code, or optimise for search.\n' +
            '4. Open Settings (the cog icon in the toolbar) to add your API key and choose a model.\n\n' +
            'Shall we start building something?',
          timestamp: Date.now(),
        })
      } else if (choice === 'build') {
        const chat = useChatStore.getState()
        chat.setExpanded(true)

        const hasProvider = !!useAiStore.getState().getConfiguredProvider()
        if (hasProvider) {
          chat.addMessage({
            id: Math.random().toString(36).substring(2, 10),
            role: 'assistant',
            content:
              'Excellent. What kind of project is this? A business site, a blog, a portfolio, something else entirely?\n\n' +
              'Tell me a bit about what you need and I\'ll help you get started.',
            timestamp: Date.now(),
          })
        } else {
          chat.addMessage({
            id: Math.random().toString(36).substring(2, 10),
            role: 'assistant',
            content:
              'Before we begin, I\'ll need access to an AI model.\n\n' +
              'Open Settings (the cog icon, or press Ctrl+,) and add an API key for your preferred provider. Once that\'s done, tell me what we\'re building.',
            timestamp: Date.now(),
          })
        }
      }
      // 'import' — no special action yet
    },
    [],
  )

  // Still loading onboarding state from DB
  if (showOnboarding === null) {
    return <div className="h-screen bg-mp-bg" />
  }

  return (
    <>
      {showOnboarding && (
        <Onboarding onChoice={handleOnboardingChoice} />
      )}

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
