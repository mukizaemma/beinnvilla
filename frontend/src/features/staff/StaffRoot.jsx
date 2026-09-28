import { Outlet } from 'react-router-dom'
import { StaffAuthProvider } from './auth/StaffAuthContext'

export default function StaffRoot() {
  return (
    <StaffAuthProvider>
      <Outlet />
    </StaffAuthProvider>
  )
}
