import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'

async function fetchAvailability() {
  const res = await apiClient.get('/api/availability-blocks?limit=100&depth=1&sort=-reopenDate')
  return (res.data.docs || []).filter((row) => row.active !== false)
}

export function useAvailability() {
  return useQuery({
    queryKey: ['availability-blocks'],
    queryFn: fetchAvailability,
    staleTime: 60 * 1000,
  })
}
