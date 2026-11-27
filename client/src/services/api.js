
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

export const imageUrl = (path) => {
  if (!path) return ''

  // Supabase absolute URL - return directly
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  // Old local uploads URL
  const serverUrl = (
    import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
  ).replace(/\/$/, '')

  return `${serverUrl}${path}`
}

export default api
