import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import GamesList from './GamesList'
import openings from '../data/openings.json'

export default function Profile({ onLoadOpening }) {
  const { user, updateProfile, removeFavorite, getGames } = useAuth()
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

  if (!user) return <div className="panel"> <div className="text-muted">Not logged in. Please login to view profile.</div> </div>

  return (
    <div className="panel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0" style={{ color: '#2c3e50' }}>👤 {user.displayName || user.username}</h4>
          <div className="text-muted small">{user.email}</div>
        </div>
        <div>
          <button
            className={`btn btn-sm ${editing ? 'btn-secondary' : 'btn-outline-primary'}`}
            onClick={() => setEditing(!editing)}
          >
            {editing ? '✕ Cancel' : '✎ Edit'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success small mb-3">✓ {successMessage}</div>
      )}

      {!editing ? (
        <div>
          {user.bio && (
            <div className="mb-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div className="text-muted small mb-1">Bio</div>
              <div style={{ fontSize: '0.95rem' }}>{user.bio}</div>
            </div>
          )}

          <div className="mb-4">
            <h6 className="mb-2 fw-bold">⭐ Favorite Openings ({user.favorites?.length || 0})</h6>
            {user.favorites && user.favorites.length ? (
              <div>
                {user.favorites.map((f) => (
                  <div key={f} className="d-flex justify-content-between align-items-center p-2 mb-1 border rounded">
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
            <h6 className="mb-2 fw-bold">🎮 Saved Games ({games.length})</h6>
            <GamesList games={games} loading={loadingGames} onPlayGame={(game) => console.log('Load game:', game)} />
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
            <button className="btn btn-sm btn-primary me-2" onClick={save}>Save</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}