import React, { useState, useRef, useEffect } from 'react'
import OpeningsList from './components/OpeningsList'
import Board from './components/Board'
import Puzzles from './components/Puzzles'
import GameControls from './components/GameControls'
import Profile from './components/Profile'
import LoginRegister from './components/LoginRegister'
import ProfileSetup from './components/ProfileSetup'
import ConnectionStatus from './components/ConnectionStatus' 
import AIPanel from './components/AIPanel' 
import GameAnalysis from './components/GameAnalysis'
import { useAuth } from './context/AuthContext'

export default function App() {
  const [selectedOpening, setSelectedOpening] = useState(null)
  const [loadedGame, setLoadedGame] = useState(null)
  const [view, setView] = useState('openings')
  const [showAuth, setShowAuth] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [boardFen, setBoardFen] = useState(null)
  const boardRef = useRef(null)
  const { user, logout } = useAuth()

  // Poll the board ref for FEN changes so AIPanel/GameAnalysis stay in sync
  // without needing to thread state through Board's internal move handlers.
  useEffect(() => {
    if (view !== 'play') return
    const interval = setInterval(() => {
      const currentFen = boardRef.current?.getFen?.()
      if (currentFen && currentFen !== boardFen) setBoardFen(currentFen)
    }, 400)
    return () => clearInterval(interval)
  }, [view, boardFen])

  useEffect(() => {
    if (user && (!user.displayName || user.displayName.trim() === '')) {
      setShowProfileSetup(true)
    } else if (user && user.displayName && user.displayName.trim() !== '') {
      setShowProfileSetup(false)
    }
  }, [user])

  const shouldShowProfileSetup = user && (!user.displayName || user.displayName.trim() === '') && showProfileSetup

  const tabs = [
    { id: 'openings', label: 'Openings' },
    { id: 'play', label: 'Play' },
    { id: 'puzzles', label: 'Puzzles' },
    { id: 'profile', label: 'Profile' },
  ]

  return (
    <div className="app-shell">
      <ConnectionStatus />

      <header className="site-header">
        <div className="site-brand">
          <div className="site-logo" aria-hidden="true">♞</div>
          <div>
            <h1 className="site-title">Chess Openings</h1>
            <p className="site-tagline">Learn · Play · Master</p>
          </div>
        </div>

        <nav className="site-nav">
          <div className="nav-tabs" role="group" aria-label="Views">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab ${view === tab.id ? 'active' : ''}`}
                onClick={() => setView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {user ? (
            <div className="d-flex align-items-center gap-2">
              <button
                className={`btn btn-sm ${aiEnabled ? 'btn-accent' : 'btn-outline-secondary'}`}
                onClick={() => setAiEnabled((v) => !v)}
                title="Toggle AI insight"
              >
                🤖 AI {aiEnabled ? 'On' : 'Off'}
              </button>
              <span className="user-badge">{user.displayName || user.username}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button
                className={`btn btn-sm ${aiEnabled ? 'btn-accent' : 'btn-outline-secondary'}`}
                onClick={() => setAiEnabled((v) => !v)}
                title="Toggle AI insight"
              >
                🤖 AI {aiEnabled ? 'On' : 'Off'}
              </button>
              <button className="btn btn-sm btn-accent" onClick={() => setShowAuth(true)}>Login / Register</button>
            </div>
          )}
        </nav>
      </header>

      {showAuth && <LoginRegister onClose={() => { setShowAuth(false) }} onLoginSuccess={() => setShowProfileSetup(true)} />}

      {shouldShowProfileSetup && (
        <ProfileSetup
          user={user}
          onClose={() => setShowProfileSetup(false)}
        />
      )}

      {view === 'openings' && (
        <div className="row g-4">
          <div className="col-md-4">
            <OpeningsList onSelectOpening={(o) => { setSelectedOpening(o); setLoadedGame(null); setView('play') }} />
          </div>

          <div className="col-md-8">
            <div className="panel hero-panel">
              <h2 className="panel-title">Welcome to the board</h2>
              <p>
                Browse popular openings and click one to load it in the Play view.
                Step through moves, export PGNs, or play freely on the interactive board.
              </p>
              <div className="hero-features">
                <span className="hero-feature">♟ 10+ Openings</span>
                <span className="hero-feature">♜ Interactive Board</span>
                <span className="hero-feature">♛ Tactical Puzzles</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'play' && (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <Board ref={boardRef} opening={selectedOpening} savedGame={loadedGame} />
            <div className="mt-4">
              <GameAnalysis
                moves={boardRef.current?.getHistory?.() || []}
                onJumpToMove={() => { /* board stepping for analysis jumps could be added here */ }}
              />
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <AIPanel
              fen={boardFen}
              enabled={aiEnabled}
              whiteRating={boardRef.current?.getOrientation?.() === 'white' ? (user?.rating ?? null) : null}
              blackRating={boardRef.current?.getOrientation?.() === 'black' ? (user?.rating ?? null) : null}
            />
            <div className="mt-4">
              <GameControls
                selectedOpening={selectedOpening}
                onLoadOpening={(o) => { setSelectedOpening(o); setLoadedGame(null); }}
                boardHistory={boardRef.current?.getHistory?.()}
                boardFen={boardRef.current?.getFen?.()}
                savedGame={loadedGame}
              />
            </div>
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
            <Profile
              onLoadOpening={(o) => { setSelectedOpening(o); setLoadedGame(null); setView('play') }}
              onLoadGame={(game) => { setLoadedGame(game); setSelectedOpening(null); setView('play') }}
            />
          </div>
        </div>
      )}

      <footer className="site-footer">
        Built with React + Bootstrap · <span>♞</span> Chess Openings Explorer
      </footer>
    </div>
  )
}
