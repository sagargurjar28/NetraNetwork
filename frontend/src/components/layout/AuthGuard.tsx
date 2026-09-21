import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function AuthGuard() {
  const location = useLocation()
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token')
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}
