"use client"

import { useQuery } from "@tanstack/react-query"

import { useAuth } from "@/components/auth-provider"
import { fetchEntriesForUser } from "@/lib/entries"
import type { Entry } from "@/types/entry"

export const entriesQueryKey = (userId: string | undefined) =>
  ["entries", userId] as const

/**
 * Loads the signed-in user’s entries from Supabase (newest first).
 * Disabled until auth is ready and a user id exists.
 */
export function useEntries() {
  const { session, isLoading: authLoading } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: entriesQueryKey(userId),
    queryFn: async (): Promise<Entry[]> => {
      if (!userId) return []
      const { data, error } = await fetchEntriesForUser(userId)
      if (error) {
        throw new Error(error.message)
      }
      return data ?? []
    },
    enabled: Boolean(userId) && !authLoading,
  })
}
