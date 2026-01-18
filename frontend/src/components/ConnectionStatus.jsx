import React from 'react'
import { useConnectionMonitor } from '../hooks/useConnectionMonitor'

export default function ConnectionStatus() {
  const { isConnected, lastChecked } = useConnectionMonitor(30000) // Check every 30 seconds

  if (isConnected) {
    return null // Don't show anything when connected
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '10px',
        textAlign: 'center',
        zIndex: 9999,
        fontWeight: 'bold'
      }}
    >
      ⚠️ Backend connection lost. Please check if the server is running on port 8080.
      {lastChecked && (
        <span style={{ fontSize: '0.85em', marginLeft: '10px' }}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
