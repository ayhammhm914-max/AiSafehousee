import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { API_BASE_URL, IS_DEMO_MODE } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [providers, setProviders] = useState({ google: false, apple: false })

  const loadProviders = async () => {
    try {
      const { data } = await api.get('/auth/providers')
      setProviders(data)
      return data
    } catch {
      setProviders({ google: false, apple: false })
      return { google: false, apple: false }
    }
  }

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      setStatus('authenticated')
      return data.user
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null)
        setStatus('guest')
        return null
      }

      setUser(null)
      setStatus('guest')
      throw error
    }
  }

  useEffect(() => {
    let active = true

    Promise.allSettled([loadProviders(), refreshUser()]).finally(() => {
      if (!active) return
      setStatus(current => (current === 'loading' ? 'guest' : current))
    })

    return () => {
      active = false
    }
  }, [])

  const login = async credentials => {
    const { data } = await api.post('/auth/login', credentials)
    setUser(data.user)
    setStatus('authenticated')
    return data
  }

  const register = async payload => {
    const { data } = await api.post('/auth/register', payload)
    setUser(data.user)
    setStatus('authenticated')
    return data
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    setStatus('guest')
  }

  const startSocialLogin = provider => {
    if (IS_DEMO_MODE) return
    window.location.assign(`${API_BASE_URL}/auth/${provider}`)
  }

  const value = useMemo(() => ({
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isDemoMode: IS_DEMO_MODE,
    providers,
    login,
    register,
    logout,
    refreshUser,
    loadProviders,
    startSocialLogin,
  }), [providers, status, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
