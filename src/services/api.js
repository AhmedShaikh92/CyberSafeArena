import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth routes return 401 for wrong credentials — that's expected, not a
// session expiry. Only redirect to login if the 401 comes from a protected
// route (i.e. NOT an /auth/ endpoint).
const AUTH_ROUTES = ['/auth/login', '/auth/register']

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url ?? ''
    const isAuthRoute = AUTH_ROUTES.some((r) => url.includes(r))

    if (error.response?.status === 401 && !isAuthRoute) {
      // Token expired or invalid on a protected route — clear and redirect
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('cybersafe-auth')

      const { useAuthStore } = await import('../store/authStore')
      useAuthStore.getState().logout()

      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api