"use client"

import * as React from "react"

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function isSpeechDictationSupported(): boolean {
  return getRecognitionCtor() !== null
}

/**
 * Appends finalized phrases while recognition runs (continuous mode).
 * Stops on toggle off or unmount. Works in Chrome and Safari (webkit).
 */
export function useSpeechDictation(
  onTranscript: (text: string) => void,
  options?: { lang?: string }
) {
  const onTranscriptRef = React.useRef(onTranscript)
  React.useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const [listening, setListening] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const recognitionRef = React.useRef<SpeechRecognition | null>(null)

  const supported = React.useMemo(() => isSpeechDictationSupported(), [])

  const stop = React.useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }, [])

  const start = React.useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return

    setError(null)
    const recognition = new Ctor()
    recognition.lang = options?.lang ?? "ru-RU"
    recognition.continuous = true
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let chunk = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i]?.isFinal) {
          chunk += event.results[i]![0]!.transcript
        }
      }
      const t = chunk.trim()
      if (t) onTranscriptRef.current(t)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        return
      }
      setError(
        event.message ||
          (event.error === "not-allowed"
            ? "Разрешите доступ к микрофону"
            : event.error)
      )
      setListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [options?.lang])

  const toggle = React.useCallback(() => {
    if (!supported) return
    if (listening) {
      stop()
    } else {
      start()
    }
  }, [supported, listening, start, stop])

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  return {
    listening,
    error,
    toggle,
    stop,
    supported,
    clearError: () => setError(null),
  }
}
