"use client"

import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  mergeTranscript,
  VoiceDictationButton,
} from "@/components/voice-dictation-button"
import { insertEntry } from "@/lib/entries"
import { cn } from "@/lib/utils"

const SCALE_MIN = 1
const SCALE_MAX = 10

const ENTRY_FORM_ID = "rage-entry-form"

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EntryForm() {
  const queryClient = useQueryClient()
  const { session, isLoading: authLoading } = useAuth()
  const [episodeLocal, setEpisodeLocal] = React.useState(() =>
    toDatetimeLocalValue(new Date())
  )
  const [notes, setNotes] = React.useState("")
  const [triggers, setTriggers] = React.useState("")
  const [factors, setFactors] = React.useState("")
  const [outcome, setOutcome] = React.useState("")
  const [intensity, setIntensity] = React.useState([5])
  const [aggression, setAggression] = React.useState([5])
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  const userId = session?.user.id
  const canSubmit =
    Boolean(userId) &&
    !authLoading &&
    !submitting &&
    notes.trim().length > 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userId || !notes.trim()) return

    setError(null)
    setSaved(false)
    setSubmitting(true)
    try {
      const episodeAt = new Date(episodeLocal).toISOString()
      const { error: insertError } = await insertEntry({
        userId,
        notes: notes.trim(),
        intensity: intensity[0],
        aggression: aggression[0],
        triggers: triggers.trim() ? triggers.trim() : null,
        factors: factors.trim() ? factors.trim() : null,
        outcome: outcome.trim() ? outcome.trim() : null,
        episodeAt,
      })
      if (insertError) {
        setError(insertError.message)
        return
      }
      await queryClient.invalidateQueries({
        queryKey: ["entries", userId],
        exact: false,
      })
      setSaved(true)
      setEpisodeLocal(toDatetimeLocalValue(new Date()))
      setNotes("")
      setTriggers("")
      setFactors("")
      setOutcome("")
      setIntensity([5])
      setAggression([5])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form
        id={ENTRY_FORM_ID}
        className="contents"
        onSubmit={handleSubmit}
      >
        <Card className="w-full shadow-sm">
          <CardHeader className="px-4 pb-2 pt-3 sm:px-6 sm:pb-3 sm:pt-4">
            <CardTitle className="text-base sm:text-lg">Запись эпизода</CardTitle>
            <CardDescription className="hidden text-sm leading-snug sm:block">
              Дата и время эпизода, краткое описание, шкалы и при необходимости
              детали ниже.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-4 pb-1 sm:gap-5 sm:px-6 sm:pb-2">
            {saved ? (
              <p className="text-muted-foreground text-sm" role="status">
                Запись сохранена
              </p>
            ) : null}
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <div className="space-y-[5px]">
              <label className="text-sm font-medium" htmlFor="entry-datetime">
                Дата и время
              </label>
              <Input
                id="entry-datetime"
                name="episode_at"
                type="datetime-local"
                placeholder="Например: 18 марта"
                title="Например: 18 марта"
                value={episodeLocal}
                onChange={(e) => {
                  setSaved(false)
                  setEpisodeLocal(e.target.value)
                }}
                disabled={submitting}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-[5px]">
              <div className="flex items-center justify-between gap-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="entry-notes"
                >
                  Краткое описание
                </label>
                <VoiceDictationButton
                  fieldLabel="Краткое описание"
                  disabled={submitting}
                  onAppendText={(phrase) => {
                    setSaved(false)
                    setNotes((prev) => mergeTranscript(prev, phrase))
                  }}
                />
              </div>
              <Textarea
                id="entry-notes"
                name="notes"
                placeholder="Кратко опишите, что произошло. Где вы были? Что делали другие? Что именно вас задело? Пример: стоял в очереди, обслуживание шло медленно, продавец отвлекался на разговоры"
                rows={3}
                value={notes}
                onChange={(e) => {
                  setSaved(false)
                  setNotes(e.target.value)
                }}
                required
                disabled={submitting}
                className="min-h-[5.25rem] py-2.5 sm:min-h-[8rem]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  className="text-sm font-medium leading-tight"
                  htmlFor="entry-intensity"
                >
                  Степень возбуждения ({SCALE_MIN}–{SCALE_MAX})
                </label>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {intensity[0]}
                </span>
              </div>
              <Slider
                id="entry-intensity"
                value={intensity}
                onValueChange={(value) => {
                  setSaved(false)
                  setIntensity(Array.isArray(value) ? [...value] : [value])
                }}
                min={SCALE_MIN}
                max={SCALE_MAX}
                step={1}
                aria-label="Степень возбуждения"
                disabled={submitting}
                className="py-1"
              />
              <p className="text-muted-foreground text-xs leading-snug">
                Насколько вы были эмоционально напряжены в моменте?
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  className="text-sm font-medium leading-tight"
                  htmlFor="entry-aggression"
                >
                  Степень агрессии ({SCALE_MIN}–{SCALE_MAX})
                </label>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {aggression[0]}
                </span>
              </div>
              <Slider
                id="entry-aggression"
                value={aggression}
                onValueChange={(value) => {
                  setSaved(false)
                  setAggression(Array.isArray(value) ? [...value] : [value])
                }}
                min={SCALE_MIN}
                max={SCALE_MAX}
                step={1}
                aria-label="Степень агрессии"
                disabled={submitting}
                className="py-1"
              />
              <p className="text-muted-foreground text-xs leading-snug">
                Насколько агрессивно вы себя вели (в словах или действиях)?
              </p>
            </div>
            <div className="space-y-[5px]">
              <div className="flex items-center justify-between gap-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="entry-triggers"
                >
                  Триггеры
                </label>
                <VoiceDictationButton
                  fieldLabel="Триггеры"
                  disabled={submitting}
                  onAppendText={(phrase) => {
                    setSaved(false)
                    setTriggers((prev) => mergeTranscript(prev, phrase))
                  }}
                />
              </div>
              <Textarea
                id="entry-triggers"
                name="triggers"
                placeholder='Какие мысли возникли в моменте? Часто это утверждения с «должен», обвинения или ожидания. Пример: "они должны работать быстрее", "это их вина"'
                rows={2}
                value={triggers}
                onChange={(e) => {
                  setSaved(false)
                  setTriggers(e.target.value)
                }}
                disabled={submitting}
                className="min-h-16 resize-y py-2.5"
              />
            </div>
            <div className="space-y-[5px]">
              <div className="flex items-center justify-between gap-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="entry-factors"
                >
                  Факторы
                </label>
                <VoiceDictationButton
                  fieldLabel="Факторы"
                  disabled={submitting}
                  onAppendText={(phrase) => {
                    setSaved(false)
                    setFactors((prev) => mergeTranscript(prev, phrase))
                  }}
                />
              </div>
              <Textarea
                id="entry-factors"
                name="factors"
                placeholder="Что могло повлиять на ваше состояние до события? Например: усталость, стресс, тревога, напряжение, плохой день"
                rows={2}
                value={factors}
                onChange={(e) => {
                  setSaved(false)
                  setFactors(e.target.value)
                }}
                disabled={submitting}
                className="min-h-16 resize-y py-2.5"
              />
            </div>
            <div className="space-y-[5px]">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium" htmlFor="entry-outcome">
                  Итог
                </label>
                <VoiceDictationButton
                  fieldLabel="Итог"
                  disabled={submitting}
                  onAppendText={(phrase) => {
                    setSaved(false)
                    setOutcome((prev) => mergeTranscript(prev, phrase))
                  }}
                />
              </div>
              <Textarea
                id="entry-outcome"
                name="outcome"
                placeholder="Чем закончилась ситуация и что вы почувствовали после? Пример: облегчения не было, позже появилось чувство вины"
                rows={2}
                value={outcome}
                onChange={(e) => {
                  setSaved(false)
                  setOutcome(e.target.value)
                }}
                disabled={submitting}
                className="min-h-16 resize-y py-2.5"
              />
            </div>
          </CardContent>
          <CardFooter className="hidden border-t bg-muted/40 px-6 py-3 md:flex md:justify-end">
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "Сохранение…" : "Сохранить запись"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <div
        className="h-[calc(5rem+env(safe-area-inset-bottom,0px))] shrink-0 md:hidden"
        aria-hidden
      />

      <div
        className={cn(
          "md:hidden",
          "fixed inset-x-0 bottom-0 z-50",
          "border-t border-border bg-background/95 backdrop-blur-md",
          "pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2",
          "shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.12)]"
        )}
      >
        <div className="mx-auto w-full max-w-[40rem] px-3">
          <Button
            type="submit"
            form={ENTRY_FORM_ID}
            size="touch"
            className="w-full"
            disabled={!canSubmit}
          >
            {submitting ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </div>
    </>
  )
}
