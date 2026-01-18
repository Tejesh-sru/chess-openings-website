import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginRegister({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ who: '', password: '', email: '', username: '', displayName: '' })
  const [error, setError] = useState(null)
  const { login, register } = useAuth()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    if (mode === 'login') {
      const r = await login({ who: form.who, password: form.password })
      if (!r.ok) {
        setError(r.error?.error || 'Login failed')
      } else {
        // Close LoginRegister first, then trigger profile setup
        onClose()
        if (onLoginSuccess) onLoginSuccess()
      }
    } else {
      const r = await register({ email: form.email, username: form.username, password: form.password, displayName: form.displayName })
      if (!r.ok) {
        setError(r.error?.error || 'Registration failed')
      } else {
        // Close LoginRegister first, then trigger profile setup
        onClose()
        if (onLoginSuccess) onLoginSuccess()
      }
    }
  }

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{mode === 'login' ? 'Login' : 'Register'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <form onSubmit={submit}>
            <div className="modal-body">
              {mode === 'login' ? (
                <>
                  <div className="mb-2">
                    <label className="form-label small">Username or Email</label>
                    <input className="form-control" value={form.who} onChange={e => setForm({ ...form, who: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Password</label>
                    <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <label className="form-label small">Email</label>
                    <input className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Username</label>
                    <input className="form-control" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Display name (optional)</label>
                    <input className="form-control" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Password</label>
                    <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  </div>
                </>
              )}

              {error && <div className="alert alert-danger small">{error}</div>}
            </div>

            <div className="modal-footer">
              <div className="me-auto small text-muted">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</div>
              <button type="button" className="btn btn-sm btn-link me-2" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Register' : 'Login'}</button>
              <button type="submit" className="btn btn-sm btn-primary">{mode === 'login' ? 'Login' : 'Register'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}