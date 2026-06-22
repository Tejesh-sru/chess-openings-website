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
    <>
      <div className="modal-backdrop-custom" />
      <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ zIndex: 9999 }}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Complete Your Profile</h5>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <p className="panel-subtitle">
                  Welcome to Chess Openings! Set up your profile so other players can recognize you.
                </p>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Display Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="Your public name"
                    required
                  />
                  <small className="text-muted">This is how other players will see you</small>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Bio (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell us about your chess interests..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Avatar URL (Optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    value={form.avatarUrl}
                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {error && <div className="alert alert-danger small">{error}</div>}
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-accent"
                  disabled={!isComplete || loading}
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
