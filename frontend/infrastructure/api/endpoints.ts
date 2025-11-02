/**
 * API endpoint constants
 * Centralizes all API routes for easier maintenance
 */

export const API_ENDPOINTS = {
  participants: {
    base: '/participants',
    byId: (id: number) => `/participants/${id}`,
    metrics: '/participants/metrics/summary',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
} as const

