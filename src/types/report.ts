import type { Entry } from "@/types/entry"

/**
 * Stored AI report row. `entriesSnapshot` mirrors entries included in the request (if any).
 */
export type Report = {
  id: string
  userId: string
  prompt: string
  body: string
  entriesSnapshot: Entry[] | null
  createdAt: string
}
