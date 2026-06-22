import React, { useState } from 'react'
import puzzles from '../data/puzzles.json'
import Board from './Board'
import AIPanel from './AIPanel'
import { useAuth } from '../context/AuthContext'

/** Side to move in a FEN string: 'w' or 'b' (2nd field). */
function sideToMove(fen) {
  const parts = fen.split(' ')
  return parts[1] === 'b' ? 'black' : 'white'
}

export default function Puzzles() {
  const [current, setCurrent] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const { user } = useAuth()

  // The user is whichever side is to move in the puzzle (they're the one
  // finding the winning move); the puzzle's difficultyRating stands in for
  // "opponent strength" on the other side -- an explicit proxy, not a real
  // measured Elo, but it gives the ML model *some* skill-gap signal instead
  // of none.
  const userSide = current ? sideToMove(current.fen) : 'white'
  const userRating = user?.rating ?? null
  const puzzleRating = current?.difficultyRating ?? null

  return (
    <div className="panel">
      <h2 className="panel-title">Tactical Puzzles</h2>
      <p className="panel-subtitle">Solve puzzles by finding the best move sequence.</p>

      <div className="row g-4">
        <div className="col-md-5">
          {puzzles.map((p) => (
            <div
              key={p.id}
              className={`puzzle-card p-3 mb-2 d-flex justify-content-between align-items-center ${current?.id === p.id ? 'active' : ''}`}
            >
              <div>
                <strong>{p.name}</strong>
                <div className="text-muted small">{p.description}</div>
              </div>
              <button
                className={`btn btn-sm ${current?.id === p.id ? 'btn-accent' : 'btn-outline-primary'}`}
                onClick={() => { setCurrent(p); setShowHint(false) }}
              >
                {current?.id === p.id ? 'Playing' : 'Start'}
              </button>
            </div>
          ))}
        </div>

        <div className="col-md-7">
          {current ? (
            <>
              <Board mode="puzzle" initialFen={current.fen} puzzleSolution={current.solution} />
              <div className="mt-3 d-flex justify-content-end">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowHint((v) => !v)}
                >
                  {showHint ? 'Hide AI Hint' : '💡 Show AI Hint'}
                </button>
              </div>
              {showHint && (
                <div className="mt-2">
                  <AIPanel
                    fen={current.fen}
                    numMoves={1}
                    whiteRating={userSide === 'white' ? userRating : puzzleRating}
                    blackRating={userSide === 'black' ? userRating : puzzleRating}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">♛</div>
              <div>Select a puzzle to begin</div>
              <div className="small mt-1">Find the winning move sequence</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

