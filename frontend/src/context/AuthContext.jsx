import React, { createContext, useContext, useEffect, useState } from 'react'
import apiClient from '../utils/apiClient'

const TOKEN_KEY = 'chess_token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
      fetchMe()
    }

    // Listen for auth events
    const handleLogout = (e) => {
      console.log('Auto logout:', e.detail?.reason)
      logout()
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [token])

  async function apiFetch(path, opts = {}) {
    return apiClient.request(path, opts)
  }

  async function fetchMe() {
    setLoading(true)
    const r = await apiFetch('/api/auth/me')
    console.log('fetchMe response:', r)
    if (r.ok) {
      console.log('User data fetched:', r.body)
      setUser(r.body)
    } else if (r.networkError) {
      // Network error - keep user logged in but show warning
      console.warn('Network error fetching user data')
    } else {
      // Auth error - logout
      console.warn('Auth error, logging out')
      setUser(null)
      setToken(null)
      apiClient.setToken(null)
      localStorage.removeItem(TOKEN_KEY)
    }
    setLoading(false)
  }

  async function login({ who, password }) {
    const r = await apiClient.post('/api/auth/login', { username: who, password })
    console.log('Login response:', r)
    if (r.ok && r.body.accessToken) {
      console.log('Login successful, setting token:', r.body.accessToken)
      localStorage.setItem(TOKEN_KEY, r.body.accessToken)
      setToken(r.body.accessToken)
      apiClient.setToken(r.body.accessToken)
      await fetchMe()
      return { ok: true }
    }
    if (r.networkError) {
      return { ok: false, error: 'Cannot connect to server. Please check if backend is running.' }
    }
    return { ok: false, error: r.body }
  }

  async function register({ email, username, password, displayName }) {
    const r = await apiClient.post('/api/auth/register', { email, username, password, displayName })
    console.log('Register response:', r)
    if (r.ok && r.body.accessToken) {
      console.log('Register successful, setting token:', r.body.accessToken)
      localStorage.setItem(TOKEN_KEY, r.body.accessToken)
      setToken(r.body.accessToken)
      apiClient.setToken(r.body.accessToken)
      await fetchMe()
      return { ok: true }
    }
    return { ok: false, error: r.body }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    apiClient.setToken(null)
    setToken(null)
    setUser(null)
  }

  async function addFavorite(openingId) {
    if (!token) return { ok: false, error: 'not authenticated' }
    const r = await apiClient.post('/api/auth/me/favorites', { openingId })
    if (r.ok) {
      // update user object
      setUser((u) => ({ ...u, favorites: r.body }))
      return { ok: true }
    }
    return { ok: false, error: r.body }
  }

  async function removeFavorite(openingId) {
    if (!token) return { ok: false, error: 'not authenticated' }
    const r = await apiClient.delete(`/api/auth/me/favorites/${openingId}`)
    if (r.ok) { setUser((u) => ({ ...u, favorites: r.body })); return { ok: true } }
    return { ok: false, error: r.body }
  }

  async function updateProfile(data) {
    if (!token) return { ok: false, error: 'not authenticated' }
    const r = await apiClient.put('/api/auth/me', data)
    if (r.ok) { await fetchMe(); return { ok: true } }
    return { ok: false, error: r.body }
  }

  async function saveGame(gameData) {
    if (!token) return { ok: false, error: 'not authenticated' }
    const r = await apiClient.post('/api/games', gameData)
    if (r.ok) return { ok: true, data: r.body }
    return { ok: false, error: r.body }
  }

  async function getGames() {
    if (!token) return { ok: false, error: 'not authenticated' }
    const r = await apiClient.get('/api/games')
    if (r.ok) return { ok: true, data: r.body }
    return { ok: false, error: r.body }
  }

  async function getProfile() {
    if (!token) return { ok: false, error: 'not authenticated' }
    const r = await apiClient.get('/api/me/profile')
    if (r.ok) return { ok: true, data: r.body }
    return { ok: false, error: r.body }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, addFavorite, removeFavorite, updateProfile, saveGame, getGames, getProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }

export default AuthContext