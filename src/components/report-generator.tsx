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
import { QueryErrorState } from "@/components/content-state"
import { ReportGeneratorHintSkeleton } from "@/components/list-skeletons"
import { Textarea } from "@/components/ui/textarea"
import { useEntries } from "@/hooks/use-entries"
import { reportsQueryKey } from "@/hooks/use-reports"

const DEFAULT_PROMPT =
  "Кратко проанализируй записи за последнюю неделю: динамика интенсивности, возможные триггеры и одна практическая рекомендация."

export function ReportGenerator() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user.id
  const {
    data: entries,
    isLoading: entriesLoading,
    error: entriesError,
    refetch: refetchEntries,
    isFetching: entriesRefetching,
  } = useEntries({ scope: "last7days" })
  const [prompt, setPrompt] = React.useState(DEFAULT_PROMPT)
  const [reportText, setReportText] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    setReportText(null)
    setIsGenerating(true)
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: prompt.trim(),
          entries: entries ?? [],
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
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader className="space-y-1 px-4 pb-1 pt-3 sm:px-6 sm:pb-2 sm:pt-4">
        <CardTitle className="text-base">Отчёт</CardTitle>
        <CardDescription className="text-xs leading-snug sm:text-sm">
          <span className="hidden sm:inline">
            В анализ попадают записи за последние 7 суток. Отчёт можно сохранить
            в базе, если вы вошли в аккаунт.
          </span>
          <span className="sm:hidden">Записи за 7 суток.</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-3 px-4 pb-1 sm:gap-4 sm:px-6 sm:pb-2">
          {entriesError ? (
            <QueryErrorState
              title="Записи не загрузились"
              message={entriesError.message}
              onRetry={() => refetchEntries()}
              isRetrying={entriesRefetching}
            />
          ) : null}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="report-prompt" className="text-sm font-medium">
              Запрос к ассистенту
            </label>
            <Textarea
              id="report-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={disabled}
              rows={3}
              className="min-h-[4rem] resize-y py-2 sm:min-h-[5.5rem]"
              aria-describedby={
                entriesLoading && !entriesError
                  ? undefined
                  : "report-prompt-hint"
              }
            />
            {entriesLoading && !entriesError ? (
              <div aria-busy="true" aria-live="polite">
                <ReportGeneratorHintSkeleton />
              </div>
            ) : (
              <p
                id="report-prompt-hint"
                className="text-muted-foreground text-xs"
              >
                {`В запросе учтено записей: ${entries?.length ?? 0}.`}
              </p>
            )}
          </div>
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
            className="w-full sm:h-9 sm:min-h-9 sm:w-auto sm:rounded-lg sm:px-3 sm:text-sm"
          >
            {isGenerating ? "Генерация…" : "Сформировать отчёт"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
