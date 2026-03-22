"use client"

import { AlertCircle, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-4 sm:px-5 sm:py-5",
        className
      )}
    >
      {Icon ? (
        <Icon
          className="text-muted-foreground size-7 shrink-0 sm:size-8"
          aria-hidden
        />
      ) : null}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

type QueryErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  isRetrying?: boolean
  className?: string
}

export function QueryErrorState({
  title = "Не удалось загрузить данные",
  message,
  onRetry,
  retryLabel = "Повторить",
  isRetrying,
  className,
}: QueryErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-sm sm:px-5 sm:py-4",
        className
      )}
    >
      <div className="flex gap-3">
        <AlertCircle
          className="text-destructive mt-0.5 size-5 shrink-0"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="font-medium text-destructive">{title}</p>
          <p className="text-destructive/90 mt-1 break-words">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start border-destructive/30 text-destructive hover:bg-destructive/10"
          disabled={isRetrying}
          onClick={onRetry}
        >
          {isRetrying ? "Загрузка…" : retryLabel}
        </Button>
      ) : null}
    </div>
  )
}
