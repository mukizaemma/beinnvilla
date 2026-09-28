/**
 * EXPERIENCES
 * ─────────────────────────────────────────────────────────────
 * Used by ExperiencePicker (Step1Stay / StaySummaryCard's "Add
 * experience" buttons) — a flat list, no page/hero wrapper needed since
 * there's no standalone /experiences route today.
 * ─────────────────────────────────────────────────────────────
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { adaptExperience } from '../adapters'

async function fetchExperiences() {
  const res = await apiClient.get('/api/experiences?limit=100&depth=1')
  return res.data.docs.map(adaptExperience)
}

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: fetchExperiences,
    staleTime: 5 * 60 * 1000,
  })
}