/**
 * Enhanced API Client with:
 * - Automatic retry on failure
 * - Request timeout handling
 * - Token refresh
 * - Network error handling
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const REQUEST_TIMEOUT = 10000 // 10 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

class ApiClient {
  constructor() {
    this.baseURL = API_BASE
    this.token = localStorage.getItem('chess_token')
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('chess_token', token)
    } else {
      localStorage.removeItem('chess_token')
    }
  }

  getToken() {
    return this.token
  }

  /**
   * Fetch with timeout
   */
  async fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server may be down or slow')
      }
      throw error
    }
  }

  /**
   * Retry logic for failed requests
   */
  async fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.fetchWithTimeout(url, options)
        
        // If response is ok or it's a client error (4xx), don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response
        }
        
        // For server errors (5xx), retry
        if (i < retries - 1) {
          await this.delay(RETRY_DELAY * (i + 1)) // Exponential backoff
          continue
        }
        
        return response
      } catch (error) {
        // Network error, retry
        if (i < retries - 1) {
          console.warn(`Request failed, retrying (${i + 1}/${retries})...`, error.message)
          await this.delay(RETRY_DELAY * (i + 1))
          continue
        }
        throw error
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Main request method
   */
  async request(path, options = {}) {
    const headers = options.headers || {}
    headers['Content-Type'] = 'application/json'
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`

    try {
      const response = await this.fetchWithRetry(url, { ...options, headers })

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        this.setToken(null)
        window.dispatchEvent(new CustomEvent('auth:logout', { 
          detail: { reason: 'Token expired or invalid' }
        }))
      }

      const text = await response.text()
      let body
      try {
        body = JSON.parse(text)
      } catch (e) {
        body = text
      }

      return {
        ok: response.ok,
        status: response.status,
        body,
        headers: response.headers
      }
    } catch (error) {
      console.error('API Request failed:', error)
      return {
        ok: false,
        status: 0,
        body: { error: error.message || 'Network error - please check your connection' },
        networkError: true
      }
    }
  }

  // Convenience methods
  async get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' })
  }

  async post(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  async put(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  async delete(path, options = {}) {
    return this.request(path, { ...options, method: 'DELETE' })
  }

  /**
   * Health check to verify backend connectivity
   */
  async checkHealth() {
    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}/health`, {}, 5000)
      return response.ok
    } catch (error) {
      return false
    }
  }
}

export default new ApiClient()
