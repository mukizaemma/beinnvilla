import axios from 'axios'
import { CMS_URL } from '@lib/apiClient'

const TOKEN_KEY = 'gv-staff-token'

export function getStaffToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setStaffToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export const staffClient = axios.create({
  baseURL: CMS_URL,
  timeout: 20000,
})

staffClient.interceptors.request.use((config) => {
  const token = getStaffToken()
  if (token) {
    config.headers.Authorization = `JWT ${token}`
  }
  return config
})

export function mediaId(value) {
  if (!value) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return value.id || ''
}

export function toLexical(text) {
  const lines = String(text || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const children = (lines.length ? lines : ['']).map((line) => ({
    type: 'paragraph',
    children: [{ type: 'text', text: line, version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }))
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
