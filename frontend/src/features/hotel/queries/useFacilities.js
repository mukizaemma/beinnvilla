import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { adaptFacility } from '../adapters'
import { FACILITIES } from '../inn'

async function fetchFacilities() {
  try {
    const res = await apiClient.get('/api/facilities?limit=100&sort=sort&depth=2')
    const docs = (res.data.docs || []).map(adaptFacility)
    if (docs.length) return docs
  } catch {
    /* the collection is empty until staff add facilities */
  }
  return FACILITIES
}

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: fetchFacilities,
    staleTime: 5 * 60 * 1000,
  })
}
