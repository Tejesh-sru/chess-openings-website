import React from 'react'

export default function GamesList({ games = [], loading = false, onPlayGame }) {
  if (loading) {
    return (
      <div className="text-muted small text-center py-3">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        Loading your games...
      </div>
    )
  }

  if (!games || games.length === 0) {
    return (
      <div className="alert alert-info small mb-0">
        <strong>No games saved yet!</strong> Start playing and save your games to view them here.
      </div>
    )
  }

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {games.map((game, idx) => (
        <div key={game.id || idx} className="p-3 mb-2 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="d-flex justify-content-between align-items-start">
            <div style={{ flex: 1 }}>
              <div className="fw-bold" style={{ fontSize: '1rem' }}>
                {game.title || 'Untitled Game'}
              </div>
              <div className="text-muted small mt-1">
                <span className="badge bg-light text-dark me-2">
                  {game.movesCount || 0} moves
                </span>
                <span>
                  {game.savedAt ? new Date(game.savedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Unknown date'}
                </span>
              </div>
            </div>
            {onPlayGame && (
              <button
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() => onPlayGame(game)}
                title="Load this game"
              >
                ▶
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
