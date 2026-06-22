import React, { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import { getWinProbability } from '../utils/aiClient'

function useOpenings() {
  const [openings, setOpenings] = useState([])
  useEffect(() => {
    fetch('/api/openings').then(r => r.json()).then(setOpenings).catch(() => setOpenings([]))
  }, [])
  return openings
}

function openingFen(moves) {
  try {
    const game = new Chess()
    for (const m of moves) game.move(m)
    return game.fen()
  } catch (e) {
    return null
  }
}

/**
 * Small inline win-probability badge for an opening card. Only fetches
 * when expanded/requested, so browsing the full list doesn't fire dozens
 * of simultaneous AI requests.
 */
function OpeningEvalBadge({ moves }) {
  const [winData, setWinData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)

  async function loadEval() {
    if (requested) return
    setRequested(true)
    setLoading(true)
    const fen = openingFen(moves)
    if (!fen) { setLoading(false); return }
    const result = await getWinProbability(fen)
    if (result.ok) setWinData(result.data)
    setLoading(false)
  }

  if (!requested) {
    return (
      <button className="btn btn-sm btn-outline-secondary" onClick={loadEval} title="Evaluate this line with the AI engine">
        🤖 Eval
      </button>
    )
  }

  if (loading) return <span className="text-muted small">Evaluating…</span>
  if (!winData) return <span className="text-muted small">N/A</span>

  return (
    <span className="small opening-eval-badge" title={`White ${winData.win_probability_white}% / Black ${winData.win_probability_black}%`}>
      ⚖️ W {winData.win_probability_white}%
    </span>
  )
}

export default function OpeningsList({ onSelectOpening }) {
  const [query, setQuery] = useState('')
  const openings = useOpenings()

  const filtered = openings.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase()) ||
    (o.eco && o.eco.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="panel">
      <h2 className="panel-title">Openings</h2>
      <p className="panel-subtitle">Search by name or ECO code</p>

      <div className="mb-3">
        <input
          className="form-control search-input"
          placeholder="Search openings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">♟</div>
            <div>No openings found</div>
          </div>
        ) : (
          filtered.map((o) => (
            <div key={o.id} className="opening-card p-3 mb-2">
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div style={{ flex: 1 }} onClick={() => onSelectOpening(o)}>
                  <strong>{o.name}</strong>
                  {o.eco && <div><span className="eco-badge">{o.eco}</span></div>}
                </div>

                <div className="opening-moves me-2">{o.moves.join(' ')}</div>

                <OpeningEvalBadge moves={o.moves} />

                <button className="btn btn-sm btn-outline-primary" onClick={() => onSelectOpening(o)}>Load</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
