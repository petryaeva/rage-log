"use client"

import { FileText } from "lucide-react"

import { EmptyState, QueryErrorState } from "@/components/content-state"
import { EntryCard } from "@/components/entry-card"
import { EntriesListSkeleton } from "@/components/list-skeletons"
import { useEntries } from "@/hooks/use-entries"

export function EntriesList() {
  const {
    data: entries,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useEntries()

  return (
    <section className="flex w-full max-w-lg flex-col gap-2.5 sm:gap-3">
      <h2 className="font-heading text-sm font-medium text-foreground">
        Последние записи
      </h2>

      {isLoading ? (
        <EntriesListSkeleton />
      ) : error ? (
        <QueryErrorState
          message={error.message}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : !entries?.length ? (
        <EmptyState
          icon={FileText}
          title="Пока нет записей"
          description="Добавьте первый эпизод в форме ниже — здесь появится история с датой и заметками."
        />
      ) : (
        <ul className="flex flex-col gap-2.5 sm:gap-3" aria-label="Ваши записи">
          {entries.map((entry) => (
            <li key={entry.id}>
              <EntryCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
