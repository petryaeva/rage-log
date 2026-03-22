"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Single-thumb slider using a native range input (no `<script>`), compatible with React 19.
 * Accepts `value` / `defaultValue` as a one-element array, matching the previous Base UI API.
 */
export type SliderProps = {
  className?: string
  value?: number | readonly number[]
  defaultValue?: number | readonly number[]
  onValueChange?: (
    value: number | readonly number[],
    eventDetails?: unknown
  ) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  id?: string
  name?: string
  "aria-label"?: string
}

function toScalar(
  v: number | readonly number[] | undefined,
  fallback: number
): number {
  if (v === undefined) return fallback
  if (typeof v === "number") return v
  if (Array.isArray(v)) return v.length > 0 ? v[0]! : fallback
  return fallback
}

function Slider({
  className,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  id,
  name,
  "aria-label": ariaLabel,
}: SliderProps) {
  const fallback = React.useMemo(
    () => Math.round((min + max) / 2),
    [min, max]
  )

  const isControlled = value !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(() =>
    toScalar(defaultValue, fallback)
  )

  const current = isControlled ? toScalar(value, fallback) : uncontrolled

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value)
    if (!isControlled) setUncontrolled(next)
    onValueChange?.([next], {})
  }

  return (
    <div
      className={cn(
        "relative flex w-full touch-none items-center py-1 select-none data-[disabled]:opacity-50",
        className
      )}
      data-slot="slider"
      data-disabled={disabled ? "" : undefined}
    >
      <input
        id={id}
        name={name}
        aria-label={ariaLabel}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={handleChange}
        className={cn(
          "h-1 w-full cursor-pointer appearance-none rounded-full bg-muted",
          "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted",
          "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted",
          "[&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:block [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:shrink-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ring [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm",
          "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:shrink-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-ring [&::-moz-range-thumb]:bg-white",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      />
    </div>
  )
}

export { Slider }
