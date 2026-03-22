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
  scope: EntriesScope = "all",
  range?: { from: string; to: string }
) {
  if (range) {
    return ["entries", userId, "range", range.from, range.to] as const
  }
  return ["entries", userId, scope] as const
}

type UseEntriesOptions = {
  scope?: EntriesScope
  range?: { from: string; to: string }
}

export function useEntries(options?: UseEntriesOptions) {
  const scope = options?.scope ?? "all"
  const range = options?.range
  const { session, isLoading: authLoading } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: entriesQueryKey(userId, scope, range),
    queryFn: async (): Promise<Entry[]> => {
      if (!userId) return []
      const fetchOpts =
        range != null
          ? { createdAfter: range.from, createdBefore: range.to }
          : scope === "last7days"
            ? { createdAfter: getCreatedAfterRollingDaysAgo(7) }
            : undefined
      const { data, error } = await fetchEntriesForUser(
        userId,
        undefined,
        fetchOpts
      )
      if (error) {
        throw new Error(error.message)
      }
      return data ?? []
    },
    enabled: Boolean(userId) && !authLoading,
  })
}
