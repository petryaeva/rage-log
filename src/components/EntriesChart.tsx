"use client"

import * as React from "react"
import { LineChart as LineChartIcon } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { EmptyState, QueryErrorState } from "@/components/content-state"
import { ChartCardSkeleton } from "@/components/list-skeletons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEntries } from "@/hooks/use-entries"

type Point = {
  id: string
  label: string
  intensity: number
}

export function EntriesChart() {
  const {
    data: entries,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useEntries({
    scope: "last7days",
  })

  const chartData = React.useMemo((): Point[] => {
    if (!entries?.length) return []
    return [...entries]
      .filter((e) => e.intensity != null)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .map((e) => ({
        id: e.id,
        label: new Intl.DateTimeFormat("ru-RU", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(e.createdAt)),
        intensity: e.intensity!,
      }))
  }, [entries])

  const header = (
    <CardHeader className="px-4 pb-1 pt-3 sm:px-6 sm:pb-2 sm:pt-4">
      <CardTitle className="text-base">Динамика возбуждения</CardTitle>
    </CardHeader>
  )

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg shadow-sm">
        {header}
        <CardContent className="px-0 pb-0 sm:px-0">
          <ChartCardSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-lg shadow-sm">
        {header}
        <CardContent className="px-4 pb-4 pt-2 sm:px-6 sm:pb-5 sm:pt-3">
          <QueryErrorState
            title="График не загрузился"
            message={error.message}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    const hasEntries = (entries?.length ?? 0) > 0
    return (
      <Card className="w-full max-w-lg shadow-sm">
        {header}
        <CardContent className="px-4 pb-4 pt-2 sm:px-6 sm:pb-5 sm:pt-3">
          {hasEntries ? (
            <EmptyState
              icon={LineChartIcon}
              title="Нет оценок для графика"
              description="За последние 7 суток есть записи, но без степени возбуждения. Укажите её при следующей записи — линия появится автоматически."
            />
          ) : (
            <EmptyState
              icon={LineChartIcon}
              title="Нет данных за неделю"
              description="Добавьте запись с оценкой возбуждения (1–10) в форме ниже — здесь появится динамика по дням."
            />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg shadow-sm">
      {header}
      <CardContent className="px-2 pb-3 pl-1 sm:px-6 sm:pb-4 sm:pl-0">
        <div className="h-[200px] w-full min-w-0 sm:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 10]}
                width={32}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: unknown) => [
                  `${value ?? "—"}/10`,
                  "Возбуждение",
                ]}
              />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
