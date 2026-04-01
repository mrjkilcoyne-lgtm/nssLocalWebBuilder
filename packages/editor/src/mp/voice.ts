// ---------------------------------------------------------------------------
// Voice Pipeline — browser-native STT/TTS with abstracted interfaces
// ---------------------------------------------------------------------------

// --- Speech-to-Text ---

export interface STTAdapter {
  start(): void
  stop(): void
  onResult: ((text: string) => void) | null
  onError: ((error: string) => void) | null
  isListening: boolean
}

class WebSpeechSTT implements STTAdapter {
  private recognition: SpeechRecognition | null = null
  onResult: ((text: string) => void) | null = null
  onError: ((error: string) => void) | null = null
  isListening = false

  constructor() {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || (window as any).webkitSpeechRecognition
        : undefined
    if (!SpeechRecognitionCtor) return

    this.recognition = new SpeechRecognitionCtor()
    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = 'en-GB'

    this.recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      this.onResult?.(transcript)
    }

    this.recognition.onerror = (event) => {
      this.isListening = false
      this.onError?.(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
    }
  }

  start() {
    if (!this.recognition) {
      this.onError?.('Speech recognition not supported in this browser.')
      return
    }
    this.isListening = true
    this.recognition.start()
  }

  stop() {
    this.isListening = false
    this.recognition?.stop()
  }
}

// --- Text-to-Speech ---

export interface TTSAdapter {
  speak(text: string): Promise<void>
  stop(): void
  isSpeaking: boolean
}

class WebSpeechTTS implements TTSAdapter {
  isSpeaking = false
  private voice: SpeechSynthesisVoice | null = null

  constructor() {
    if (typeof window === 'undefined') return
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      this.voice =
        voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('female')) ??
        voices.find(v => v.lang === 'en-GB') ??
        voices.find(v => v.lang.startsWith('en')) ??
        null
    }
    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      if (this.voice) utterance.voice = this.voice
      utterance.lang = 'en-GB'
      utterance.rate = 0.95
      utterance.pitch = 1.0

      this.isSpeaking = true
      utterance.onend = () => {
        this.isSpeaking = false
        resolve()
      }
      utterance.onerror = () => {
        this.isSpeaking = false
        resolve()
      }

      speechSynthesis.speak(utterance)
    })
  }

  stop() {
    if (typeof window !== 'undefined') {
      speechSynthesis.cancel()
    }
    this.isSpeaking = false
  }
}

// --- Factory ---

export function createSTT(): STTAdapter {
  return new WebSpeechSTT()
}

export function createTTS(): TTSAdapter {
  return new WebSpeechTTS()
}

// --- Availability check ---

export function isSTTAvailable(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition)
}

export function isTTSAvailable(): boolean {
  if (typeof window === 'undefined') return false
  return 'speechSynthesis' in window
}
