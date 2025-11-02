'use server'

import axios from '@/infrastructure/api/axios-client'
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints'
import type { AxiosError } from 'axios'

interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: number
    email: string
    full_name: string | null
  }
}

interface AuthError {
  error: string
}

export async function register(_prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  try {
    const response = await axios.post<AuthResponse>(API_ENDPOINTS.auth.register, {
      email,
      password,
      full_name: fullName || null,
    })

    const authData = response.data
    return { success: true, user: authData.user, token: authData.access_token }
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>
    const errorMessage = axiosError.response?.data?.error || 'Network error. Please try again.'
    return { error: errorMessage }
  }
}

export async function login(_prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const response = await axios.post<AuthResponse>(API_ENDPOINTS.auth.login, {
      email,
      password,
    })

    const authData = response.data
    return { success: true, user: authData.user, token: authData.access_token }
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>
    const errorMessage = axiosError.response?.data?.error || 'Network error. Please try again.'
    return { error: errorMessage }
  }
}

