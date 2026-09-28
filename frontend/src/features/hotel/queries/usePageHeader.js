import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { mediaUrl } from '../adapters'

export function usePageHeader(slug, { nested = true } = {}) {
  return useQuery({
    queryKey: ['page-header', slug, nested],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/api/globals/${slug}?depth=1`)
        return nested ? mediaUrl(data?.hero?.backgroundImage) : mediaUrl(data?.backgroundImage)
      } catch {
        return ''
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
