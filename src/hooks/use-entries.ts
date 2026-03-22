"use client"

import { useQuery } from "@tanstack/react-query"

import { useAuth } from "@/components/auth-provider"
import {
  fetchEntriesForUser,
  getCreatedAfterRollingDaysAgo,
} from "@/lib/entries"
import type { Entry } from "@/types/entry"

export type EntriesScope = "all" | "last7days"

function entriesQueryKey(
  userId: string | undefined,
  scope: EntriesScope = "all"
) {
  return ["entries", userId, scope] as const
}

type UseEntriesOptions = {
  /** `last7days` — только записи за последние 7 суток (по `created_at`). */
  scope?: EntriesScope
}

/**
 * Loads the signed-in user’s entries from Supabase (newest first).
 * Disabled until auth is ready and a user id exists.
 */
export function useEntries(options?: UseEntriesOptions) {
  const scope = options?.scope ?? "all"
  const { session, isLoading: authLoading } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: entriesQueryKey(userId, scope),
    queryFn: async (): Promise<Entry[]> => {
      if (!userId) return []
      const { data, error } = await fetchEntriesForUser(
        userId,
        undefined,
        scope === "last7days"
          ? { createdAfter: getCreatedAfterRollingDaysAgo(7) }
          : undefined
      )
      if (error) {
        throw new Error(error.message)
      }
      return data ?? []
    },
    enabled: Boolean(userId) && !authLoading,
  })
}
