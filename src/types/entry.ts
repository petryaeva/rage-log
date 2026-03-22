/**
 * A single journal record (outburst / episode).
 * Use ISO 8601 strings for timestamps (e.g. from Supabase `timestamptz`).
 */
export type Entry = {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  /** When the episode happened (UI); falls back to createdAt if null in DB. */
  episodeAt?: string | null
  /** What happened; main body of the log */
  notes: string
  /** Self-rated arousal / «возбуждение», 1–10 */
  intensity?: number | null
  /** Self-rated aggression, 1–10 */
  aggression?: number | null
  /** Legacy single field; prefer `triggers` when present */
  trigger?: string | null
  triggers?: string | null
  factors?: string | null
  outcome?: string | null
}
