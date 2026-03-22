"use client"

import { useQuery } from "@tanstack/react-query"

import { useAuth } from "@/components/auth-provider"
import { fetchReportsForUser } from "@/lib/reports"
import type { Report } from "@/types/report"

export const reportsQueryKey = (userId: string | undefined) =>
  ["reports", userId] as const

/**
 * Loads the signed-in user’s saved reports from Supabase (newest first).
 */
export function useReports() {
  const { session, isLoading: authLoading } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: reportsQueryKey(userId),
    queryFn: async (): Promise<Report[]> => {
      if (!userId) return []
      const { data, error } = await fetchReportsForUser(userId)
      if (error) {
        throw new Error(error.message)
      }
      return data ?? []
    },
    enabled: Boolean(userId) && !authLoading,
  })
}
