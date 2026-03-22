"use client"

import { EntryCard } from "@/components/entry-card"
import { useEntries } from "@/hooks/use-entries"

export function EntriesList() {
  const { data: entries, isLoading, error } = useEntries()

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm" aria-busy="true">
        Загрузка записей…
      </p>
    )
  }

  if (error) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {error.message}
      </p>
    )
  }

  if (!entries?.length) {
    return (
      <p className="text-muted-foreground text-sm">Пока нет записей.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-sm font-medium text-foreground">
        Последние записи
      </h2>
      <ul className="flex flex-col gap-3" aria-label="Ваши записи">
        {entries.map((entry) => (
          <li key={entry.id}>
            <EntryCard entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  )
}
