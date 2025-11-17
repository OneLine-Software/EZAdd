// Composable for interacting with Cloudflare Functions API

const API_BASE = import.meta.env.PROD 
  ? '/api' // Production: same domain
  : 'http://localhost:5173/api' // Development: local dev server

export function useApi() {
  const submitFeatureRequest = async (data: {
    title: string
    description?: string
    email?: string
  }) => {
    try {
      const response = await fetch(`${API_BASE}/feature-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit feature request')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error submitting feature request:', error)
      throw error
    }
  }

  const submitFeedback = async (data: {
    name?: string
    email?: string
    message: string
    rating?: number
  }) => {
    try {
      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw error
    }
  }

  const logStat = async (event_type: string, metadata?: Record<string, any>) => {
    try {
      // Fire and forget - don't block UI
      fetch(`${API_BASE}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type, metadata })
      }).catch(() => {}) // Silently fail
    } catch (error) {
      // Silently fail stats logging
    }
  }

  return {
    submitFeatureRequest,
    submitFeedback,
    logStat
  }
}
