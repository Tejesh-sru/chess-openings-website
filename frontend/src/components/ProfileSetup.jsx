import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProfileSetup({ onClose, user }) {
  const [form, setForm] = useState({
    displayName: user?.displayName && user.displayName.trim() ? user.displayName : user?.username || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { updateProfile } = useAuth()

  useEffect(() => {
    // Update form when user changes, ensuring username is pre-filled if no displayName
    if (user) {
      setForm({
        displayName: user.displayName && user.displayName.trim() ? user.displayName : user.username || '',
        bio: user?.bio || '',
        avatarUrl: user?.avatarUrl || ''
      })
    }
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await updateProfile({
        displayName: form.displayName || user.username,
        bio: form.bio,
        avatarUrl: form.avatarUrl
      })

      if (result.ok) {
        onClose()
      } else {
        setError(result.error?.error || 'Failed to update profile')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isComplete = form.displayName && form.displayName.trim().length > 0

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 5px 30px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '500px',
        margin: '20px'
      }}>
        <div style={{ borderBottom: '1px solid #dee2e6', padding: '16px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h5 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>✨ Complete Your Profile</h5>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px' }}>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '16px' }}>
              Welcome to Chess Openings! Let's set up your profile so other players can recognize you.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Display Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Your public name"
                required
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>This is how other players will see you</small>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Bio (Optional)</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about yourself... (e.g., 'Ruy Lopez enthusiast', 'Love tactical puzzles')"
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>Let other players know about your chess interests</small>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Avatar URL (Optional)</label>
              <input
                type="url"
                className="form-control"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>Link to your profile picture</small>
            </div>

            {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
          </div>

          <div style={{ borderTop: '1px solid #dee2e6', padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isComplete || loading}
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
