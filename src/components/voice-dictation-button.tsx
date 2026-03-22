"use client"

import { Mic, Square } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { useSpeechDictation } from "@/hooks/use-speech-dictation"
import { cn } from "@/lib/utils"

export function mergeTranscript(current: string, addition: string): string {
  const t = addition.trim()
  if (!t) return current
  if (!current.trim()) return t
  return `${current.replace(/\s+$/, "")} ${t}`
}

type VoiceDictationButtonProps = {
  /** Append recognized phrase; typically `setX((p) => mergeTranscript(p, phrase))`. */
  onAppendText: (phrase: string) => void
  disabled?: boolean
  /** Short label for aria and tooltip, e.g. «Краткое описание» */
  fieldLabel: string
  className?: string
}

/**
 * Browser speech-to-text (Chrome / Safari). Does not record audio; only streams text.
 */
export function VoiceDictationButton({
  onAppendText,
  disabled,
  fieldLabel,
  className,
}: VoiceDictationButtonProps) {
  const onTranscript = React.useCallback(
    (text: string) => {
      const t = text.trim()
      if (t) onAppendText(t)
    },
    [onAppendText]
  )

  const { listening, error, toggle, supported, clearError } =
    useSpeechDictation(onTranscript)

  React.useEffect(() => {
    if (error) {
      const t = window.setTimeout(() => clearError(), 6000)
      return () => window.clearTimeout(t)
    }
  }, [error, clearError])

  if (!supported) {
    return null
  }

  return (
    <div className={cn("flex flex-col items-end gap-0.5", className)}>
      <Button
        type="button"
        variant={listening ? "secondary" : "outline"}
        size="icon-sm"
        className={cn(
          "shrink-0",
          listening && "ring-2 ring-primary/40"
        )}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={
          listening
            ? `Остановить диктовку: ${fieldLabel}`
            : `Голосовой ввод: ${fieldLabel}`
        }
        title={
          listening
            ? "Остановить диктовку"
            : "Добавить текст голосом (Chrome, Safari)"
        }
        onClick={() => {
          clearError()
          toggle()
        }}
      >
        {listening ? (
          <Square className="size-3.5 fill-current" aria-hidden />
        ) : (
          <Mic className="size-4" aria-hidden />
        )}
      </Button>
      {error ? (
        <p className="text-destructive max-w-[12rem] text-right text-[11px] leading-tight">
          {error}
        </p>
      ) : null}
    </div>
  )
}
