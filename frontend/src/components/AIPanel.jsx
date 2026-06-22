import React, { useEffect, useState, useRef } from 'react'
import { getSuggestedMoves, getWinProbability, getMLWinProbability } from '../utils/aiClient'

/**
 * Live AI sidebar: shows win-probability from TWO sources side by side --
 *   1. The Stockfish-eval-based logistic formula (untrained, same approach
 *      lichess/chess.com use for their eval bars)
 *   2. A trained XGBoost model (fit on ~75K positions sampled from ~20K
 *      real Lichess games -- see python-services/ml_models/README.md)
 * -- plus top engine move suggestions.
 *
 * Props:
 *   fen          - current position (FEN string)
 *   enabled      - whether to show/run AI features at all (default true)
 *   numMoves     - how many candidate moves to request (default 3)
 *   whiteRating  - optional Elo for White, passed to the ML model only
 *                  (the formula-based endpoint has no way to use this --
 *                  that's the whole point of showing both side by side)
 *   blackRating  - optional Elo for Black, passed to the ML model only
 */
export default function AIPanel({ fen, enabled = true, numMoves = 3, whiteRating = null, blackRating = null }) {
  const [winData, setWinData] = useState(null)
  const [mlWinData, setMlWinData] = useState(null)
  const [mlError, setMlError] = useState(null)
  const [moves, setMoves] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!enabled || !fen) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      setMlError(null)

      const [winResult, movesResult, mlResult] = await Promise.all([
        getWinProbability(fen),
        getSuggestedMoves(fen, { numMoves }),
        getMLWinProbability(fen, { whiteRating, blackRating }),
      ])

      if (winResult.ok) {
        setWinData(winResult.data)
      } else {
        setError(winResult.error)
        setWinData(null)
      }

      if (movesResult.ok) {
        setMoves(movesResult.data.suggested_moves || [])
      } else {
        setMoves([])
      }

      if (mlResult.ok) {
        setMlWinData(mlResult.data)
      } else {
        setMlError(mlResult.error)
        setMlWinData(null)
      }

      setLoading(false)
    }, 350)

    return () => clearTimeout(debounceRef.current)
  }, [fen, enabled, numMoves, whiteRating, blackRating])

  if (!enabled) return null

  const whiteWin = winData?.win_probability_white
  const blackWin = winData?.win_probability_black
  const mlWhiteWin = mlWinData?.win_probability_white
  const mlBlackWin = mlWinData?.win_probability_black

  return (
    <div className="panel ai-panel">
      <div className="panel-header">
        <strong>🤖 AI Insight</strong>
        {loading && <span className="text-muted small">Analyzing…</span>}
      </div>

      {error && (
        <div className="alert alert-warning small mb-2">
          Engine win% unavailable: {error}
        </div>
      )}

      {winData && (
        <div className="mb-2">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Black {blackWin}%</span>
            <span className="ai-source-label">Engine formula (untrained)</span>
            <span>White {whiteWin}%</span>
          </div>
          <div className="win-bar">
            <div className="win-bar-white" style={{ width: `${whiteWin}%` }} title={`White: ${whiteWin}% win probability`} />
          </div>
        </div>
      )}

      {mlError && (
        <div className="alert alert-warning small mb-2">
          ML model unavailable: {mlError}
        </div>
      )}

      {mlWinData && (
        <div className="mb-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Black {mlBlackWin}%</span>
            <span className="ai-source-label">Trained model (XGBoost, 20K games)</span>
            <span>White {mlWhiteWin}%</span>
          </div>
          <div className="win-bar win-bar-ml">
            <div className="win-bar-white" style={{ width: `${mlWhiteWin}%` }} title={`White: ${mlWhiteWin}% win probability (trained model)`} />
          </div>
          {(whiteRating || blackRating) && (
            <div className="small text-muted mt-1">
              Using ratings: White {whiteRating ?? '?'} / Black {blackRating ?? '?'}
            </div>
          )}
        </div>
      )}

      {winData?.best_move && (
        <div className="small text-muted mb-2">
          Engine's top move: <strong>{winData.best_move}</strong>
        </div>
      )}

      {moves.length > 0 && (
        <div>
          <h6 className="panel-title" style={{ fontSize: '0.85rem' }}>Suggested Moves</h6>
          <ol className="ai-move-list">
            {moves.map((m, i) => (
              <li key={i} className="ai-move-item">
                <span className="ai-move-rank">{i + 1}.</span>
                <strong>{m.move}</strong>
                <span className="text-muted small ms-2">
                  {m.score.startsWith('Mate') ? m.score : `eval ${m.cp >= 0 ? '+' : ''}${(m.cp / 100).toFixed(2)}`}
                </span>
                {m.continuation?.length > 1 && (
                  <div className="small text-muted ai-continuation">
                    {m.continuation.slice(0, 4).join(' ')}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {!winData && !mlWinData && !moves.length && !loading && !error && !mlError && (
        <div className="text-muted small">Make a move to see AI insight.</div>
      )}
    </div>
  )
}
