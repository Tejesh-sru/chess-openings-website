import React from 'react'
import { useConnectionMonitor } from '../hooks/useConnectionMonitor'

export default function ConnectionStatus() {
  const { isConnected, lastChecked } = useConnectionMonitor(30000)

  if (isConnected) {
    return null
  }

  return (
    <div className="connection-banner">
      Backend connection lost — please check if the server is running on port 8080.
      {lastChecked && (
        <span style={{ fontSize: '0.85em', marginLeft: '10px', opacity: 0.85 }}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
