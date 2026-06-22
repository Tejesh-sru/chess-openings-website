import React, { useState } from 'react'
import { analyzeGame } from '../utils/aiClient'

const CLASSIFICATION_META = {
  best: { label: 'Best', color: '#3a9e3a', icon: '✓' },
  excellent: { label: 'Excellent', color: '#6fae3a', icon: '✓' },
  good: { label: 'Good', color: '#9aa83a', icon: '·' },
  inaccuracy: { label: 'Inaccuracy', color: '#d9a93a', icon: '?!' },
  mistake: { label: 'Mistake', color: '#d97a3a', icon: '?' },
  blunder: { label: 'Blunder', color: '#cc4444', icon: '??' },
}

/**
 * Full game analysis / post-game report. Takes a list of SAN moves and
 * asks the AI service to classify each one, then renders a move-by-move
 * breakdown plus a summary of move quality across the whole game.
 *
 * Props:
 *   moves        - array of SAN move strings for the game
 *   startingFen  - optional starting FEN (defaults to standard start position)
 *   onJumpToMove - optional callback(fen, plyIndex) when a move row is clicked
 */
export default function GameAnalysis({ moves, startingFen = null, onJumpToMove }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function runAnalysis() {
    if (!moves || moves.length === 0) {
      setError('No moves to analyze yet.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await analyzeGame(moves, { startingFen })
    if (result.ok) {
      setReport(result.data)
    } else {
      setError(result.error)
      setReport(null)
    }
    setLoading(false)
  }

  const summary = report?.summary
  const totalMoves = summary ? Object.values(summary).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="panel game-analysis-panel">
      <div className="panel-header">
        <strong>📊 Game Analysis</strong>
        <button
          className="btn btn-sm btn-accent"
          onClick={runAnalysis}
          disabled={loading || !moves || moves.length === 0}
        >
          {loading ? 'Analyzing…' : report ? 'Re-analyze' : 'Analyze Game'}
        </button>
      </div>

      {error && (
        <div className="alert alert-warning small mb-2">{error}</div>
      )}

      {!report && !loading && !error && (
        <div className="text-muted small">
          Run a full analysis to see move-quality breakdown and spot blunders.
        </div>
      )}

      {summary && (
        <div className="mb-3">
          <div className="analysis-summary-bar">
            {Object.entries(summary).map(([key, count]) => (
              count > 0 && (
                <div
                  key={key}
                  className="analysis-summary-segment"
                  style={{
                    flex: count,
                    background: CLASSIFICATION_META[key].color,
                  }}
                  title={`${CLASSIFICATION_META[key].label}: ${count}`}
                />
              )
            ))}
          </div>
          <div className="analysis-summary-legend">
            {Object.entries(summary).map(([key, count]) => (
              count > 0 && (
                <span key={key} className="analysis-legend-item">
                  <span className="legend-dot" style={{ background: CLASSIFICATION_META[key].color }} />
                  {CLASSIFICATION_META[key].label}: {count}
                </span>
              )
            ))}
          </div>
          <div className="text-muted small mt-1">{totalMoves} moves analyzed</div>
        </div>
      )}

      {report?.moves?.length > 0 && (
        <div className="analysis-move-list">
          {report.moves.map((m) => {
            const meta = CLASSIFICATION_META[m.classification]
            return (
              <div
                key={m.ply}
                className="analysis-move-row"
                style={{ cursor: onJumpToMove ? 'pointer' : 'default' }}
                onClick={() => onJumpToMove?.(m.fen_after, m.ply)}
              >
                <span className="analysis-move-num text-muted">{Math.ceil(m.ply / 2)}{m.side === 'white' ? '.' : '...'}</span>
                <strong className="analysis-move-san">{m.move}</strong>
                <span
                  className="analysis-move-badge"
                  style={{ background: meta.color }}
                  title={meta.label}
                >
                  {meta.icon}
                </span>
                {m.classification !== 'best' && m.best_move && (
                  <span className="text-muted small">best: {m.best_move}</span>
                )}
                {m.cp_loss > 0 && (
                  <span className="text-muted small">(-{(m.cp_loss / 100).toFixed(2)})</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
