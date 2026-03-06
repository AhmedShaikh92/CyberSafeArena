import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '../services/api'
import { useProgressionStore } from './progressionStore'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post('/auth/login', { email, password })
          const { token, user } = res.data
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user, token, isAuthenticated: true, isLoading: false })
          useProgressionStore.getState().seedFromUser(user)
          return { success: true }
        } catch (err) {
          const error = err.response?.data?.message || 'Login failed'
          set({ error, isLoading: false })
          return { success: false, error }
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post('/auth/register', { username, email, password })
          const { token, user } = res.data
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user, token, isAuthenticated: true, isLoading: false })
          useProgressionStore.getState().seedFromUser(user)
          return { success: true }
        } catch (err) {
          const error = err.response?.data?.message || 'Registration failed'
          set({ error, isLoading: false })
          return { success: false, error }
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        useProgressionStore.setState({ hydrated: false })
        set({ user: null, token: null, isAuthenticated: false })
      },

      // Still exported so ProtectedRoute can call it, but the critical
      // header restoration now also happens at module load below
      restoreSession: () => {
        const { token, user } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          useProgressionStore.getState().seedFromUser(user)
        }
      },

      updateUser: (data) => {
        set((state) => {
          const updatedUser = { ...state.user, ...data }
          // Explicitly write back to localStorage so the persisted user
          // is always in sync — Zustand's reactive detection can miss this
          // when called from async handlers outside React's update cycle
          try {
            const stored = JSON.parse(localStorage.getItem('cybersafe-auth') || '{}')
            if (stored.state) {
              stored.state.user = updatedUser
              localStorage.setItem('cybersafe-auth', JSON.stringify(stored))
            }
          } catch (_) {}
          return { user: updatedUser }
        })
      },

      updateToken: (token) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ token })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cybersafe-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      // onRehydrateStorage fires synchronously after the persisted state is
      // loaded into the store — before any component renders
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
          if (state.user) {
            useProgressionStore.getState().seedFromUser(state.user)
          }
        }
      },
    }
  )
)