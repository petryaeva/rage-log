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
import { entriesQueryKey } from "@/hooks/use-entries"
import { createEntry } from "@/lib/entries"

const INTENSITY_MIN = 1
const INTENSITY_MAX = 10

export function EntryForm() {
  const queryClient = useQueryClient()
  const { session, isLoading: authLoading } = useAuth()
  const [notes, setNotes] = React.useState("")
  const [trigger, setTrigger] = React.useState("")
  const [intensity, setIntensity] = React.useState([5])
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
      const { error: insertError } = await createEntry({
        userId,
        notes: notes.trim(),
        intensity: intensity[0],
        trigger: trigger.trim() ? trigger.trim() : null,
      })
      if (insertError) {
        setError(insertError.message)
        return
      }
      await queryClient.invalidateQueries({ queryKey: entriesQueryKey(userId) })
      setSaved(true)
      setNotes("")
      setTrigger("")
      setIntensity([5])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Запись эпизода</CardTitle>
        <CardDescription>
          Кратко опишите событие, оцените степень возбуждения и укажите факторы и
          итог.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-6">
          {saved ? (
            <p className="text-sm text-muted-foreground" role="status">
              Запись сохранена
            </p>
          ) : null}
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="entry-notes">
              Краткое описание события
            </label>
            <Textarea
              id="entry-notes"
              name="notes"
              placeholder="Что произошло…"
              rows={5}
              value={notes}
              onChange={(e) => {
                setSaved(false)
                setNotes(e.target.value)
              }}
              required
              disabled={submitting}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium" htmlFor="entry-intensity">
                Степень возбуждения ({INTENSITY_MIN}–{INTENSITY_MAX})
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
              min={INTENSITY_MIN}
              max={INTENSITY_MAX}
              step={1}
              aria-label="Степень возбуждения"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="entry-trigger">
              Предшествующие факторы, мысли-триггеры, результат эпизода
            </label>
            <p className="text-muted-foreground text-xs leading-snug">
              Примеры: боль, тревога, мышечное напряжение; «должен», обвиняющие
              утверждения; как завершился эпизод.
            </p>
            <Input
              id="entry-trigger"
              name="trigger"
              type="text"
              placeholder="Необязательно"
              value={trigger}
              onChange={(e) => {
                setSaved(false)
                setTrigger(e.target.value)
              }}
              disabled={submitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/50">
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? "Сохранение…" : "Сохранить запись"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
