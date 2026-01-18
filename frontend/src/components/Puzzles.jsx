import React, { useState } from 'react'
import puzzles from '../data/puzzles.json'
import Board from './Board'

export default function Puzzles() {
  const [current, setCurrent] = useState(null)

  return (
    <div className="panel">
      <h5>Puzzles</h5>
      <p className="text-muted small">Solve tactical puzzles. Click Start to load a puzzle position.</p>

      <div className="row">
        <div className="col-md-6">
          {puzzles.map((p) => (
            <div key={p.id} className="p-2 mb-2 border rounded d-flex justify-content-between align-items-center">
              <div>
                <strong>{p.name}</strong>
                <div className="text-muted small">{p.description}</div>
              </div>
              <div>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setCurrent(p)}>Start</button>
              </div>
            </div>
          ))}
        </div>

        <div className="col-md-6">
          {current ? (
            <div>
              <Board mode="puzzle" initialFen={current.fen} puzzleSolution={current.solution} />
            </div>
          ) : (
            <div className="text-muted">Select a puzzle to start</div>
          )}
        </div>
      </div>
    </div>
  )
}
