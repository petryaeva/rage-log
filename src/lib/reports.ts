import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Entry } from "@/types/entry"
import type { Report } from "@/types/report"

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

export type InsertReportInput = {
  userId: string
  prompt: string
  body: string
  /** Serialized to `entries_snapshot` (jsonb); omit or null when no entries were sent. */
  entriesSnapshot?: Entry[] | null
}

type ReportRow = {
  id: string
  user_id: string
  prompt: string
  body: string
  entries_snapshot: unknown | null
  created_at: string
}

function rowToReport(row: ReportRow): Report {
  let entriesSnapshot: Entry[] | null = null
  const raw = row.entries_snapshot
  if (Array.isArray(raw)) {
    entriesSnapshot = raw as Entry[]
  }

  return {
    id: row.id,
    userId: row.user_id,
    prompt: row.prompt,
    body: row.body,
    entriesSnapshot,
    createdAt: row.created_at,
  }
}

/**
 * Inserts into `reports`. Must use a Supabase client that carries the user JWT (e.g. {@link createSupabaseServerClient}).
 */
export async function insertReport(
  input: InsertReportInput,
  supabase: SupabaseClient
): Promise<{ data: Report | null; error: PostgrestError | null }> {
  const snapshot =
    input.entriesSnapshot && input.entriesSnapshot.length > 0
      ? input.entriesSnapshot
      : null

  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: input.userId,
      prompt: input.prompt,
      body: input.body,
      entries_snapshot: snapshot,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: rowToReport(data as ReportRow), error: null }
}

/** Lists saved reports for a user, newest first. */
export async function fetchReportsForUser(
  userId: string,
  client?: SupabaseClient | null
): Promise<{ data: Report[] | null; error: PostgrestError | null }> {
  const supabase = client ?? getSupabaseClient()
  if (!supabase) {
    return { data: null, error: notConfiguredError() }
  }

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return { data: null, error }
  }

  return {
    data: (data as ReportRow[]).map((row) => rowToReport(row)),
    error: null,
  }
}
