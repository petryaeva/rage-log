/**
 * A single journal record (outburst / episode).
 * Use ISO 8601 strings for timestamps (e.g. from Supabase `timestamptz`).
 */
export type Entry = {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  /** What happened; main body of the log */
  notes: string
  /** Self-rated intensity, e.g. 1–10 */
  intensity?: number | null
  /** What set it off, if known */
  trigger?: string | null
}
