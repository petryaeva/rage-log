"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const SCALE_MIN = 1
const SCALE_MAX = 10

type QuickEntryProps = {
  className?: string
}

export function QuickEntry({ className }: QuickEntryProps) {
  const [arousal, setArousal] = React.useState([5])
  const [aggression, setAggression] = React.useState([5])

  return (
    <Card className={cn("w-full max-w-lg py-3", className)}>
      <CardHeader className="px-4 pb-0 pt-3">
        <CardTitle className="text-base">Быстрая оценка</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 px-4 sm:grid-cols-2 sm:gap-4">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">
              Степень возбуждения ({SCALE_MIN}–{SCALE_MAX})
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {arousal[0]}
            </span>
          </div>
          <Slider
            value={arousal}
            onValueChange={(v) =>
              setArousal(Array.isArray(v) ? [...v] : [v])
            }
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={1}
            aria-label="Степень возбуждения"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">
              Степень агрессии ({SCALE_MIN}–{SCALE_MAX})
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {aggression[0]}
            </span>
          </div>
          <Slider
            value={aggression}
            onValueChange={(v) =>
              setAggression(Array.isArray(v) ? [...v] : [v])
            }
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={1}
            aria-label="Степень агрессии"
          />
        </div>
      </CardContent>
    </Card>
  )
}
