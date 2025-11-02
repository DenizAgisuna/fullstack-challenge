/**
 * Configure global axios instance with interceptors
 * Automatically handles authentication tokens and error handling
 * 
 * After importing this module, you can use axios.get(), axios.post(), etc. directly
 * Token will be automatically injected by interceptors
 */

import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

/**
 * Configure global axios defaults
 * This applies to all axios requests (axios.get(), axios.post(), etc.)
 */
axios.defaults.baseURL = API_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.timeout = 10000 // 10 second timeout

/**
 * Request interceptor - automatically injects auth token
 * Token is read from localStorage on each request
 * This runs for ALL axios requests automatically
 */
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Auto-inject token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - handles errors globally
 * This runs for ALL axios responses automatically
 */
axios.interceptors.response.use(
  (response) => {
    // Return response as-is (axios wraps it in AxiosResponse)
    return response
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear auth and redirect
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    
    // Transform error to consistent format
    const errorMessage = 
      (error.response?.data as { error?: string })?.error ||
      error.message ||
      'Request failed'
    
    return Promise.reject(new Error(errorMessage))
  }
)

/**
 * Export configured axios for direct use
 * Now you can: import axios from '@/lib/api/axios-client'
 * Then use: axios.get(), axios.post(), etc.
 */
export default axios

