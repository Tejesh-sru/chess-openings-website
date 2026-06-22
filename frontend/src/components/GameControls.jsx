import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function useOpenings() {
  const [openings, setOpenings] = useState([])
  useEffect(() => {
    fetch('/api/openings').then(r => r.json()).then(setOpenings).catch(() => setOpenings([]))
  }, [])
  return openings
}

export default function GameControls({ selectedOpening, onLoadOpening, boardHistory, boardFen, savedGame = null }) {
  const { user, addFavorite, saveGame } = useAuth()
  const [gameTitle, setGameTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const openings = useOpenings()

  function loadRandom() {
    if (!openings || openings.length === 0) return
    const pick = openings[Math.floor(Math.random() * openings.length)]
    onLoadOpening(pick)
  }

  function saveFavorite() {
    if (!selectedOpening) return
    addFavorite(selectedOpening.id)
  }

  async function handleSaveGame() {
    if (!boardHistory || boardHistory.length === 0) {
      alert('No moves to save')
      return
    }

    if (!user) {
      alert('Please login to save games')
      return
    }
    
    setSaving(true)
    try {
      const gameData = {
        title: gameTitle || `Game (${boardHistory.length} moves)`,
        moves: JSON.stringify(boardHistory),
        movesCount: boardHistory.length
      }
      
      const result = await saveGame(gameData)
      if (result.ok) {
        alert('✓ Game saved! View it in your Profile.')
        setGameTitle('')
      } else {
        alert('Failed to save game: ' + (result.error?.message || 'Unknown error'))
      }
    } catch (error) {
      alert('Error saving game: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Controls</h2>
      <p className="panel-subtitle">Load openings and save your games</p>

      <div className="mb-2 d-flex flex-wrap gap-2">
        <button className="btn btn-sm btn-primary" onClick={() => onLoadOpening(selectedOpening)}>Load Selected</button>
        <button className="btn btn-sm btn-outline-secondary" onClick={loadRandom}>Load Random</button>
        <button className="btn btn-sm btn-accent" onClick={saveFavorite}>Save Favorite</button>
      </div>

      {!user && <div className="text-muted small mb-2">Login to save favorites</div>}

      <hr className="section-divider" />

      <h6 className="panel-title" style={{ fontSize: '0.9rem' }}>Save Game</h6>
      {!user && (
        <div className="alert alert-warning small mb-2">
          <strong>Login required</strong> to save games to your profile
        </div>
      )}
      <div className="mb-2">
        <input 
          type="text" 
          className="form-control form-control-sm mb-2" 
          placeholder="Game title (optional)" 
          value={gameTitle}
          onChange={(e) => setGameTitle(e.target.value)}
        />
        <button
          className="btn btn-sm btn-accent w-100"
          onClick={handleSaveGame}
          disabled={saving || !boardHistory || boardHistory.length === 0 || !user}
        >
          {!user ? 'Login to save' : saving ? 'Saving...' : '💾 Save This Game'}
        </button>
      </div>
      {boardHistory && boardHistory.length > 0 && (
        <div className="text-muted small">📊 Moves: {boardHistory.length}</div>
      )}

      <hr className="section-divider" />

      <div className="mt-3">
        <h6 className="panel-title" style={{ fontSize: '0.9rem' }}>Selected</h6>
        {selectedOpening ? (
          <div>
            <div><strong>{selectedOpening.name}</strong></div>
            <div className="text-muted small">{selectedOpening.eco}</div>
            <div className="mt-2 text-muted small">{selectedOpening.moves.join(' ')}</div>
          </div>
        ) : savedGame ? (
          <div>
            <div><strong>🎮 {savedGame.title || 'Untitled Game'}</strong></div>
            <div className="text-muted small">Saved Game</div>
            <div className="mt-2 text-muted small">Moves: {savedGame.movesCount || 0}</div>
          </div>
        ) : (
          <div className="text-muted small">No opening selected</div>
        )}
      </div>

      <hr className="section-divider" />
      <div>
        <h6 className="panel-title" style={{ fontSize: '0.9rem' }}>PGN Export</h6>
        <p className="small text-muted mb-0">You can export a PGN from the board and paste into other apps.</p>
      </div>
    </div>
  )
}
