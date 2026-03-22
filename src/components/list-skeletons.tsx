import { Skeleton } from "@/components/ui/skeleton"

export function ChartCardSkeleton() {
  return (
    <div
      className="px-2 pb-3 pl-1 sm:px-6 sm:pb-4 sm:pl-0"
      aria-hidden
      aria-label="Загрузка графика"
    >
      <Skeleton className="h-[200px] w-full rounded-lg sm:h-[240px]" />
    </div>
  )
}

export function EntriesListSkeleton() {
  return (
    <ul
      className="flex flex-col gap-2.5 sm:gap-3"
      aria-hidden
      aria-label="Загрузка записей"
    >
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="space-y-3 rounded-xl px-4 py-3 ring-1 ring-border/60"
        >
          <Skeleton className="h-2.5 w-28" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full max-w-[12rem]" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ReportsListSkeleton() {
  return (
    <ul
      className="flex flex-col gap-2.5 sm:gap-3"
      aria-hidden
      aria-label="Загрузка отчётов"
    >
      {[0, 1].map((i) => (
        <li
          key={i}
          className="space-y-2 rounded-xl px-3 py-2.5 ring-1 ring-border/60 sm:px-4 sm:py-3"
        >
          <Skeleton className="h-2.5 w-36" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </li>
      ))}
    </ul>
  )
}

export function ReportGeneratorHintSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-2.5 w-56" />
    </div>
  )
}
