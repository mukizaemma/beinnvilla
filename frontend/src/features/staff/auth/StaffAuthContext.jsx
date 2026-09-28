import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { staffClient, getStaffToken, setStaffToken } from '../api/staffClient'

const StaffAuthContext = createContext(null)

export function StaffAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getStaffToken()
    if (!token) {
      setReady(true)
      return
    }
    staffClient
      .get('/api/users/me')
      .then((res) => {
        if (res.data?.user) setUser(res.data.user)
        else setStaffToken('')
      })
      .catch(() => setStaffToken(''))
      .finally(() => setReady(true))
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(email, password) {
        const { data } = await staffClient.post('/api/users/login', { email, password })
        if (data.user?.status === 'inactive') {
          setStaffToken('')
          throw new Error('This account is inactive.')
        }
        setStaffToken(data.token)
        setUser(data.user)
        return data.user
      },
      async forgotPassword(email) {
        await staffClient.post('/api/users/forgot-password', { email })
      },
      async resetPassword(token, password) {
        const { data } = await staffClient.post('/api/users/reset-password', { token, password })
        if (data.token) setStaffToken(data.token)
        if (data.user) setUser(data.user)
        return data.user
      },
      async logout() {
        try {
          await staffClient.post('/api/users/logout')
        } catch {
          /* token is cleared locally either way */
        }
        setStaffToken('')
        setUser(null)
      },
    }),
    [user, ready],
  )

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext)
  if (!ctx) throw new Error('useStaffAuth must be used inside StaffAuthProvider')
  return ctx
}
