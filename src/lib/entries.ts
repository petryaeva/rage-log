import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Entry } from "@/types/entry"

/** Payload for a new row (DB generates `id` and timestamps). */
export type InsertEntryInput = {
  userId: string
  notes: string
  intensity?: number | null
  aggression?: number | null
  triggers?: string | null
  factors?: string | null
  outcome?: string | null
  episodeAt?: string | null
}

type EntryRow = {
  id: string
  user_id: string
  notes: string
  intensity: number | null
  aggression: number | null
  trigger: string | null
  triggers: string | null
  factors: string | null
  outcome: string | null
  episode_at: string | null
  created_at: string
  updated_at: string
}

function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    notes: row.notes,
    intensity: row.intensity,
    aggression: row.aggression,
    trigger: row.trigger,
    triggers: row.triggers,
    factors: row.factors,
    outcome: row.outcome,
    episodeAt: row.episode_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function notConfiguredError(): PostgrestError {
  return {
    name: "PostgrestError",
    message:
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    details: "",
    hint: "",
    code: "PGRST000",
  } as PostgrestError
}

/**
 * Inserts a row into the `entries` table and returns the mapped {@link Entry}.
 * Uses {@link getSupabaseClient} when `client` is omitted (typical in client components).
 */
export async function insertEntry(
  input: InsertEntryInput,
  client?: SupabaseClient | null
): Promise<{ data: Entry | null; error: PostgrestError | null }> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) {
    return { data: null, error: notConfiguredError() }
  }

  const triggers = input.triggers?.trim() ? input.triggers.trim() : null
  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: input.userId,
      notes: input.notes,
      intensity: input.intensity ?? null,
      aggression: input.aggression ?? null,
      trigger: triggers,
      triggers,
      factors: input.factors?.trim() ? input.factors.trim() : null,
      outcome: input.outcome?.trim() ? input.outcome.trim() : null,
      episode_at: input.episodeAt ?? null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: rowToEntry(data as EntryRow), error: null }
}

/** ISO timestamp for `created_at >= …` (скользящие последние `days` суток). */
export function getCreatedAfterRollingDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export type FetchEntriesOptions = {
  /** Оставить только строки с `created_at` не раньше этой метки (ISO). */
  createdAfter?: string
  /** Оставить только строки с `created_at` не позже этой метки (ISO). */
  createdBefore?: string
}

/** Lists entries for a user, newest first. */
export async function fetchEntriesForUser(
  userId: string,
  client?: SupabaseClient | null,
  options?: FetchEntriesOptions
): Promise<{ data: Entry[] | null; error: PostgrestError | null }> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) {
    return { data: null, error: notConfiguredError() }
  }

  let query = supabase
    .from("entries")
    .select("*")
    .eq("user_id", userId)

  if (options?.createdAfter) {
    query = query.gte("created_at", options.createdAfter)
  }
  if (options?.createdBefore) {
    query = query.lte("created_at", options.createdBefore)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return { data: null, error }
  }

  return {
    data: (data as EntryRow[]).map((row) => rowToEntry(row)),
    error: null,
  }
}
