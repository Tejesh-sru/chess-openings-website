import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import GamesList from './GamesList'
import openingsSrc from '../data/openings.json'

// load from API fallback to local data
function useOpenings() {
  const [openings, setOpenings] = useState(openingsSrc)
  useEffect(() => {
    fetch('/api/openings').then(r => r.json()).then(setOpenings).catch(() => {})
  }, [])
  return openings
}

export default function Profile({ onLoadOpening, onLoadGame }) {
  const { user, updateProfile, removeFavorite, getGames } = useAuth()
  const openings = useOpenings()

  function loadGame(game) {
    if (onLoadGame) onLoadGame(game)
  }
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ displayName: '', avatarUrl: '', bio: '' })
  const [games, setGames] = useState([])
  const [loadingGames, setLoadingGames] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (user) setForm({ displayName: user.displayName || '', avatarUrl: user.avatarUrl || '', bio: user.bio || '' })
  }, [user])

  useEffect(() => {
    if (user) {
      loadGames()
    }
  }, [user])

  async function loadGames() {
    setLoadingGames(true)
    try {
      const result = await getGames()
      if (result.ok) {
        setGames(result.data || [])
      }
    } catch (error) {
      console.error('Error loading games:', error)
    }
    setLoadingGames(false)
  }

  async function save() {
    const result = await updateProfile(form)
    if (result.ok) {
      setEditing(false)
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  function loadOpening(id) {
    const o = openings.find(x => x.id === id)
    if (o && onLoadOpening) onLoadOpening(o)
  }

  if (!user) return (
    <div className="panel">
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <div>Not logged in</div>
        <div className="small mt-1">Please login to view your profile</div>
      </div>
    </div>
  )

  return (
    <div className="panel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="profile-avatar">♚</div>
          <div>
            <h2 className="panel-title mb-0">{user.displayName || user.username}</h2>
            <div className="text-muted small">{user.email}</div>
          </div>
        </div>
        <div>
          <button
            className={`btn btn-sm ${editing ? 'btn-secondary' : 'btn-outline-primary'}`}
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success small mb-3">✓ {successMessage}</div>
      )}

      {!editing ? (
        <div>
          {user.bio && (
            <div className="mb-3 p-3 status-bar">
              <div className="text-muted small mb-1">Bio</div>
              <div style={{ fontSize: '0.95rem' }}>{user.bio}</div>
            </div>
          )}

          <div className="mb-4">
            <h6 className="panel-title" style={{ fontSize: '0.95rem' }}>Favorite Openings ({user.favorites?.length || 0})</h6>
            {user.favorites && user.favorites.length ? (
              <div>
                {user.favorites.map((f) => (
                  <div key={f} className="opening-card p-2 mb-2 d-flex justify-content-between align-items-center">
                    <div>
                      <div><strong>{(openings.find(o => o.id === f) || { name: f }).name}</strong></div>
                      <div className="text-muted small">{(openings.find(o => o.id === f) || { eco: '' }).eco}</div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => loadOpening(f)}>Load</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeFavorite(f)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted small">No favorite openings yet</div>
            )}
          </div>

          <div>
            <h6 className="panel-title" style={{ fontSize: '0.95rem' }}>Saved Games ({games.length})</h6>
            <GamesList games={games} loading={loadingGames} onPlayGame={loadGame} />
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2">
            <label className="form-label small">Display name</label>
            <input className="form-control" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div className="mb-2">
            <label className="form-label small">Avatar URL</label>
            <input className="form-control" value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} />
          </div>
          <div className="mb-2">
            <label className="form-label small">Bio</label>
            <textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div>
            <button className="btn btn-sm btn-accent me-2" onClick={save}>Save</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}