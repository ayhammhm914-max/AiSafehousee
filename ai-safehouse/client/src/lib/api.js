import axios from 'axios'
import demoApi from './demoApi'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || (!import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL)

export function getApiErrorMessage(
  error,
  fallbackMessage = 'Something went wrong. Please try again.',
  offlineMessage = 'Backend is offline. Start the server and try again.',
) {
  const serverMessage = error?.response?.data?.error || error?.response?.data?.message
  if (serverMessage) {
    return serverMessage
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return offlineMessage
  }

  return fallbackMessage
}

const axiosApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

const api = IS_DEMO_MODE ? demoApi : axiosApi

export default api
