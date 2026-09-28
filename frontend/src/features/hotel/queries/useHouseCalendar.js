import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'

async function fetchHouseCalendar() {
  const res = await apiClient.get('/api/availability/house')
  return res.data
}

export function useHouseCalendar() {
  return useQuery({
    queryKey: ['house-calendar'],
    queryFn: fetchHouseCalendar,
    staleTime: 60 * 1000,
  })
}
