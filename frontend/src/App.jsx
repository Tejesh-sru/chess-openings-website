import React, { useState, useRef, useEffect } from 'react'
import OpeningsList from './components/OpeningsList'
import Board from './components/Board'
import Puzzles from './components/Puzzles'
import GameControls from './components/GameControls'
import Profile from './components/Profile'
import LoginRegister from './components/LoginRegister'
import ProfileSetup from './components/ProfileSetup'
import ConnectionStatus from './components/ConnectionStatus'
import { useAuth } from './context/AuthContext'

export default function App() {
  const [selectedOpening, setSelectedOpening] = useState(null)
  const [view, setView] = useState('openings') // 'openings' | 'play' | 'puzzles' | 'profile'
  const [showAuth, setShowAuth] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const boardRef = useRef(null)
  const { user, logout } = useAuth()

  // Auto-show profile setup when user logs in without displayName
  useEffect(() => {
    if (user && (!user.displayName || user.displayName.trim() === '')) {
      console.log('User logged in without displayName, showing profile setup. User:', user)
      setShowProfileSetup(true)
    } else if (user && user.displayName && user.displayName.trim() !== '') {
      console.log('User has displayName, hiding profile setup')
      setShowProfileSetup(false)
    }
  }, [user])

  // Show profile setup modal if user just logged in but hasn't set display name
  const shouldShowProfileSetup = user && (!user.displayName || user.displayName.trim() === '') && showProfileSetup

  return (
    <div className="container py-4">
      <ConnectionStatus />
      <nav className="mb-3 d-flex justify-content-between align-items-center">
        <h1 className="h3 mb-0">Chess Openings</h1>
        <div>
          <div className="btn-group me-3" role="group" aria-label="Views">
            <button className={`btn btn-sm ${view === 'openings' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('openings')}>Openings</button>
            <button className={`btn btn-sm ${view === 'play' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('play')}>Play</button>
            <button className={`btn btn-sm ${view === 'puzzles' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('puzzles')}>Puzzles</button>
            <button className={`btn btn-sm ${view === 'profile' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('profile')}>Profile</button>
          </div>

          {user ? (
            <div className="d-inline">
              <span className="me-2 small text-muted">{user.displayName || user.username}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={logout}>Logout</button>
            </div>
          ) : (
            <button className="btn btn-sm btn-outline-primary" onClick={() => setShowAuth(true)}>Login / Register</button>
          )}
        </div>
      </nav>

      {showAuth && <LoginRegister onClose={() => { setShowAuth(false) }} onLoginSuccess={() => setShowProfileSetup(true)} />}

      {shouldShowProfileSetup && (
        <ProfileSetup 
          user={user} 
          onClose={() => {
            console.log('ProfileSetup closed')
            setShowProfileSetup(false) 
          }} 
        />
      )}

      {view === 'openings' && (
        <div className="row g-4">
          <div className="col-md-4">
            <OpeningsList onSelectOpening={(o) => { setSelectedOpening(o); setView('play') }} />
          </div>

          <div className="col-md-8">
            <div className="panel">
              <h5 className="mb-2">Welcome</h5>
              <p className="mb-0">Browse popular openings and click one to load it in the Play view. Use the Play tab to step through moves, export PGNs, or play freely.</p>
            </div>
          </div>
        </div>
      )}

      {view === 'play' && (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <Board ref={boardRef} opening={selectedOpening} />
          </div>
          <div className="col-12 col-lg-4">
            <GameControls 
              selectedOpening={selectedOpening} 
              onLoadOpening={(o) => setSelectedOpening(o)}
              boardHistory={boardRef.current?.getHistory?.()}
              boardFen={boardRef.current?.getFen?.()}
            />
          </div>
        </div>
      )}

      {view === 'puzzles' && (
        <div className="row g-4">
          <div className="col-12">
            <Puzzles />
          </div>
        </div>
      )}

      {view === 'profile' && (
        <div className="row g-4">
          <div className="col-12">
            <Profile onLoadOpening={(o) => { setSelectedOpening(o); setView('play') }} />
          </div>
        </div>
      )}

      <footer className="mt-4 text-muted small">Built with React + Bootstrap</footer>
    </div>
  )
}
