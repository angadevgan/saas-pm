import { useEffect } from 'react'
import { useAuthStore } from '../store/auth.store'
import api from '../api/axios'

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token && !user) {
      api.get('/auth/me')
        .then(res => setAuth(res.data.data, token))
        .catch(() => clearAuth())
    }
  }, [])

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    clearAuth()
    window.location.href = '/login'
  }

  return { user, isAuthenticated, logout }
}