import { useState, useEffect, useCallback } from 'react'
import apiClient from '../utils/apiClient'

/**
 * Hook to monitor backend connection status
 * Performs periodic health checks
 */
export function useConnectionMonitor(checkInterval = 30000) {
  const [isConnected, setIsConnected] = useState(true)
  const [lastChecked, setLastChecked] = useState(null)

  const checkConnection = useCallback(async () => {
    try {
      const healthy = await apiClient.checkHealth()
      setIsConnected(healthy)
      setLastChecked(new Date())
      
      if (!healthy) {
        console.warn('Backend connection lost')
      }
    } catch (error) {
      setIsConnected(false)
      setLastChecked(new Date())
      console.error('Health check failed:', error)
    }
  }, [])

  useEffect(() => {
    // Initial check
    checkConnection()

    // Periodic checks
    const interval = setInterval(checkConnection, checkInterval)

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('Network connection restored')
      checkConnection()
    }

    const handleOffline = () => {
      console.log('Network connection lost')
      setIsConnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkConnection, checkInterval])

  return { isConnected, lastChecked, checkConnection }
}
