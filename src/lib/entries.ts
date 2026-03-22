import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Entry } from "@/types/entry"

/** Payload for a new row (DB generates `id` and timestamps). */
export type InsertEntryInput = {
  userId: string
  notes: string
  intensity?: number | null
  trigger?: string | null
}

type EntryRow = {
  id: string
  user_id: string
  notes: string
  intensity: number | null
  trigger: string | null
  created_at: string
  updated_at: string
}

function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    notes: row.notes,
    intensity: row.intensity,
    trigger: row.trigger,
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
 *
 * Table columns: `id`, `user_id`, `notes`, `intensity`, `trigger`, `created_at`, `updated_at`.
 */
export async function insertEntry(
  input: InsertEntryInput,
  client?: SupabaseClient | null
): Promise<{ data: Entry | null; error: PostgrestError | null }> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) {
    return { data: null, error: notConfiguredError() }
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: input.userId,
      notes: input.notes,
      intensity: input.intensity ?? null,
      trigger: input.trigger ?? null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: rowToEntry(data as EntryRow), error: null }
}

/** Lists entries for a user, newest first. */
export async function fetchEntriesForUser(
  userId: string,
  client?: SupabaseClient | null
): Promise<{ data: Entry[] | null; error: PostgrestError | null }> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) {
    return { data: null, error: notConfiguredError() }
  }

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return { data: null, error }
  }

  return {
    data: (data as EntryRow[]).map((row) => rowToEntry(row)),
    error: null,
  }
}

/** Alias for {@link insertEntry} (same behavior). */
export const createEntry = insertEntry
