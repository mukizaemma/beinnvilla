/**
 * API CLIENT
 * ─────────────────────────────────────────────────────────────
 * Single Axios instance for all Payload CMS requests. Any failed
 * request (network down, 4xx/5xx) surfaces a toast automatically —
 * individual hooks don't need to handle that themselves.
 * ─────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { toast } from 'sonner'

/**
 * Public origin of Payload (/api, /admin, media).
 *
 * Vite inlines VITE_* at `npm run build`. In production, never fall back
 * to localhost — visitors' browsers would call their own machine.
 * Empty or localhost in a production build uses same-origin so nginx
 * can proxy /api on this host.
 */
function cmsOrigin() {
  const fromEnv = String(import.meta.env.VITE_CMS_URL || '')
    .trim()
    .replace(/\/$/, '')

  if (import.meta.env.PROD) {
    if (!fromEnv || /localhost|127\.0\.0\.1/.test(fromEnv)) {
      return ''
    }
    return fromEnv
  }

  return fromEnv || 'http://localhost:3000'
}

export const CMS_URL = cmsOrigin()

export const apiClient = axios.create({
  baseURL: CMS_URL,
  timeout: 10000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    toast.error('Could not reach the CMS — some content may be out of date.')
    return Promise.reject(error)
  }
)
