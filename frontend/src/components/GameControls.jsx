import React, { useState } from 'react'
import openings from '../data/openings.json'
import { useAuth } from '../context/AuthContext'

export default function GameControls({ selectedOpening, onLoadOpening, boardHistory, boardFen }) {
  const { user, addFavorite, saveGame } = useAuth()
  const [gameTitle, setGameTitle] = useState('')
  const [saving, setSaving] = useState(false)

  function loadRandom() {
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
      <h5>Controls</h5>

      <div className="mb-2">
        <button className="btn btn-sm btn-primary me-2" onClick={() => onLoadOpening(selectedOpening)}>Load Selected</button>
        <button className="btn btn-sm btn-outline-secondary me-2" onClick={loadRandom}>Load Random</button>
        <button className="btn btn-sm btn-outline-success" onClick={saveFavorite}>Save Favorite</button>
      </div>

      {!user && <div className="text-muted small mb-2">Login to save favorites</div>}

      <hr />

      <h6 className="small">Save Game</h6>
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
          className="btn btn-sm btn-info w-100" 
          onClick={handleSaveGame}
          disabled={saving || !boardHistory || boardHistory.length === 0 || !user}
        >
          {!user ? 'Login to save' : saving ? 'Saving...' : '💾 Save This Game'}
        </button>
      </div>
      {boardHistory && boardHistory.length > 0 && (
        <div className="text-muted small">📊 Moves: {boardHistory.length}</div>
      )}

      <hr />

      <div className="mt-3">
        <h6 className="small text-muted">Selected</h6>
        {selectedOpening ? (
          <div>
            <div><strong>{selectedOpening.name}</strong></div>
            <div className="text-muted small">{selectedOpening.eco}</div>
            <div className="mt-2 text-muted small">{selectedOpening.moves.join(' ')}</div>
          </div>
        ) : (
          <div className="text-muted small">No opening selected</div>
        )}
      </div>

      <hr />
      <div>
        <h6 className="small text-muted">PGN</h6>
        <p className="small text-muted mb-0">You can export a PGN from the board and paste into other apps.</p>
      </div>
    </div>
  )
}
