import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only force-logout if we actually had a token — not during startup
      // race conditions where the header wasn't set yet
      const hasToken = !!api.defaults.headers.common['Authorization']
      if (hasToken) {
        delete api.defaults.headers.common['Authorization']
        localStorage.removeItem('cybersafe-auth')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api