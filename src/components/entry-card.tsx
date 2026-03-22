import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Entry } from "@/types/entry"

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

type EntryCardProps = {
  entry: Entry
  className?: string
}

export function EntryCard({ entry, className }: EntryCardProps) {
  const hasMeta =
    entry.intensity != null || (entry.trigger != null && entry.trigger !== "")

  return (
    <Card
      size="sm"
      className={cn(
        "text-left shadow-none ring-1 ring-border/70 transition-colors hover:ring-border",
        className
      )}
    >
      <CardHeader className="pb-0 pt-3">
        <time
          className="text-[11px] font-medium tracking-wide text-muted-foreground tabular-nums"
          dateTime={entry.createdAt}
        >
          Дата и время: {formatWhen(entry.createdAt)}
        </time>
      </CardHeader>
      <CardContent className="space-y-1.5 px-4 pb-4 pt-2">
        <p className="text-muted-foreground text-xs font-medium">
          Краткое описание события
        </p>
        <p className="text-[15px] leading-snug tracking-tight whitespace-pre-wrap text-foreground">
          {entry.notes}
        </p>
      </CardContent>
      {hasMeta ? (
        <CardFooter className="gap-2 border-t border-border/50 bg-muted/25 px-4 py-2.5">
          <div className="flex flex-wrap gap-2">
            {entry.intensity != null ? (
              <span className="inline-flex items-center rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground ring-1 ring-border/60">
                Возбуждение: {entry.intensity}/10
              </span>
            ) : null}
            {entry.trigger ? (
              <span className="inline-flex max-w-full items-center rounded-full bg-background/80 px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-border/60">
                <span className="truncate">Факторы и итог: {entry.trigger}</span>
              </span>
            ) : null}
          </div>
        </CardFooter>
      ) : null}
    </Card>
  )
}
