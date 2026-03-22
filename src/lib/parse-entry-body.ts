import type { Entry } from "@/types/entry"

/** Validates one JSON object shaped like {@link Entry} (camelCase) from the client. */
export function parseEntryFromRequestBody(item: unknown): Entry | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null
  }
  const o = item as Record<string, unknown>
  if (typeof o.notes !== "string") {
    return null
  }

  const id = typeof o.id === "string" ? o.id : ""
  const userId = typeof o.userId === "string" ? o.userId : ""
  const createdAt = typeof o.createdAt === "string" ? o.createdAt : ""
  const updatedAt =
    typeof o.updatedAt === "string" ? o.updatedAt : createdAt || ""

  let intensity: number | null | undefined
  if (o.intensity === null) {
    intensity = null
  } else if (typeof o.intensity === "number" && Number.isFinite(o.intensity)) {
    intensity = o.intensity
  } else {
    intensity = undefined
  }

  let trigger: string | null | undefined
  if (o.trigger === null) {
    trigger = null
  } else if (typeof o.trigger === "string") {
    trigger = o.trigger
  } else {
    trigger = undefined
  }

  return {
    id,
    userId,
    notes: o.notes,
    intensity,
    trigger,
    createdAt,
    updatedAt,
  }
}

export function parseEntriesFromRequestBody(raw: unknown): Entry[] | null {
  if (!Array.isArray(raw)) {
    return null
  }
  const out: Entry[] = []
  for (const item of raw) {
    const entry = parseEntryFromRequestBody(item)
    if (!entry) {
      return null
    }
    out.push(entry)
  }
  return out
}
