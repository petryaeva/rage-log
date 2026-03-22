"use client"

import { ScrollText } from "lucide-react"

import { EmptyState, QueryErrorState } from "@/components/content-state"
import { ReportsListSkeleton } from "@/components/list-skeletons"
import { useReports } from "@/hooks/use-reports"

function formatReportDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

export function ReportsList() {
  const {
    data: reports,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useReports()

  return (
    <section className="flex w-full flex-col gap-2.5 sm:gap-3">
      <h2 className="font-heading text-sm font-medium text-foreground">
        Сохранённые отчёты
      </h2>

      {isLoading ? (
        <ReportsListSkeleton />
      ) : error ? (
        <QueryErrorState
          message={error.message}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : !reports?.length ? (
        <EmptyState
          icon={ScrollText}
          title="Пока нет сохранённых отчётов"
          description="Сформируйте отчёт в блоке выше — после генерации он сохранится здесь, если вы вошли в аккаунт."
        />
      ) : (
        <ul className="flex flex-col gap-2.5 sm:gap-3" aria-label="Сохранённые отчёты">
          {reports.map((report) => (
            <li
              key={report.id}
              className="bg-card rounded-xl px-3 py-2.5 ring-1 ring-foreground/10 sm:px-4 sm:py-3"
            >
              <p className="text-muted-foreground text-xs tabular-nums">
                {formatReportDate(report.createdAt)}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground line-clamp-2">
                {report.prompt}
              </p>
              <div className="text-foreground mt-2 max-h-48 overflow-y-auto text-sm whitespace-pre-wrap">
                {report.body}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
