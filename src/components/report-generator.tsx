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
import { QueryErrorState } from "@/components/content-state"
import { useEntries } from "@/hooks/use-entries"
import { reportsQueryKey } from "@/hooks/use-reports"

function toDateInputLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function localDayStartIso(dateStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number)
  return new Date(y, mo - 1, d, 0, 0, 0, 0).toISOString()
}

function localDayEndIso(dateStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number)
  return new Date(y, mo - 1, d, 23, 59, 59, 999).toISOString()
}

function defaultRange(): { from: string; to: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 7)
  return { from: toDateInputLocal(start), to: toDateInputLocal(end) }
}

export function ReportGenerator() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user.id
  const [{ from: fromDate, to: toDate }, setRange] = React.useState(() =>
    defaultRange()
  )
  const range = React.useMemo(
    () => ({
      from: localDayStartIso(fromDate),
      to: localDayEndIso(toDate),
    }),
    [fromDate, toDate]
  )

  const {
    data: entries,
    isLoading: entriesLoading,
    error: entriesError,
    refetch: refetchEntries,
    isFetching: entriesRefetching,
  } = useEntries({ range })

  const [reportText, setReportText] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    setReportText(null)
    if (fromDate > toDate) {
      setSubmitError("Начало периода не может быть позже конца.")
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          entries: entries ?? [],
          periodStart: fromDate,
          periodEnd: toDate,
        }),
      })
      if (!res.ok) {
        let message = res.statusText
        try {
          const data = (await res.json()) as { error?: unknown }
          if (typeof data.error === "string") {
            message = data.error
          }
        } catch {
          // ignore
        }
        throw new Error(message)
      }
      const text = await res.text()
      setReportText(text)
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: reportsQueryKey(userId),
        })
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Не удалось получить отчёт."
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const disabled =
    isGenerating || entriesLoading || Boolean(entriesError)

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="space-y-1 px-4 pb-1 pt-3 sm:px-6 sm:pb-2 sm:pt-4">
        <CardTitle className="text-base">Отчёт</CardTitle>
        <CardDescription className="text-xs leading-snug sm:text-sm">
          Выберите период (по умолчанию — последние 7 дней). Отчёт сохранится в
          базе при входе в аккаунт.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4 px-4 pb-1 sm:gap-4 sm:px-6 sm:pb-2">
          {entriesError ? (
            <QueryErrorState
              title="Записи не загрузились"
              message={entriesError.message}
              onRetry={() => refetchEntries()}
              isRetrying={entriesRefetching}
            />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="report-from"
                className="text-sm font-medium"
              >
                С даты
              </label>
              <Input
                id="report-from"
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setRange((r) => ({ ...r, from: e.target.value }))
                }
                disabled={disabled}
                className="h-12"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="report-to" className="text-sm font-medium">
                По дату
              </label>
              <Input
                id="report-to"
                type="date"
                value={toDate}
                onChange={(e) =>
                  setRange((r) => ({ ...r, to: e.target.value }))
                }
                disabled={disabled}
                className="h-12"
              />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            {entriesLoading
              ? "Загрузка записей…"
              : `Записей в периоде: ${entries?.length ?? 0}.`}
          </p>
          {submitError ? (
            <QueryErrorState
              title="Не удалось сформировать отчёт"
              message={submitError}
            />
          ) : null}
          {reportText ? (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Ответ</p>
              <div
                className="bg-muted/50 max-h-52 overflow-y-auto rounded-lg border border-border px-3 py-2 text-sm whitespace-pre-wrap sm:max-h-72"
                role="region"
                aria-live="polite"
              >
                {reportText}
              </div>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="border-t border-border/60 bg-muted/20 px-3 py-2.5 sm:px-6 sm:py-3">
          <Button
            type="submit"
            size="touch"
            disabled={disabled}
            className="w-full sm:h-11 sm:min-h-11 sm:w-auto sm:rounded-lg sm:px-4 sm:text-base"
          >
            {isGenerating ? "Генерация…" : "Сгенерировать отчёт"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
