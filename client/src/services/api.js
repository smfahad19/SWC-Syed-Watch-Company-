import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://swc-syed-watch-company-backend.vercel.app/api/v1',
  withCredentials: true,
})

export default api