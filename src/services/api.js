import axios from 'axios'

const api = axios.create({
  baseURL: 'http://192.168.1.118:8000',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// 🔒 FORCE CSRF TOKEN FOR LARAVEL
api.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))

  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token.split('=')[1])
  }

  return config
})

export default api
