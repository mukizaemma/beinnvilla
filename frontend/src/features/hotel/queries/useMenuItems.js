import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { adaptMenuItem } from '../adapters'

async function fetchMenuItems() {
  const res = await apiClient.get('/api/menu-items?limit=200&sort=sort&depth=1')
  return (res.data.docs || [])
    .map(adaptMenuItem)
    .filter((item) => item.available)
}

export function useMenuItems() {
  return useQuery({
    queryKey: ['menu-items'],
    queryFn: fetchMenuItems,
    staleTime: 5 * 60 * 1000,
  })
}
