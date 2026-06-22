/**
 * Client for the Python AI service (Stockfish-powered move prediction,
 * win prediction, and full-game analysis).
 *
 * In dev, Vite proxies '/ai-api' -> http://localhost:5001 (see vite.config.js).
 * In production, point VITE_AI_API_BASE at wherever the Python service is hosted.
 */

const AI_API_BASE = import.meta.env.VITE_AI_API_BASE || '/ai-api'
const REQUEST_TIMEOUT = 15000

async function postJSON(path, body) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(`${AI_API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json().catch(() => null)

    if (!response.ok || !data) {
      return { ok: false, error: data?.message || `AI service error (${response.status})` }
    }
    return { ok: true, data }
  } catch (error) {
    clearTimeout(timeoutId)
    const message = error.name === 'AbortError'
      ? 'AI service timed out - is it running?'
      : (error.message || 'AI service unreachable')
    return { ok: false, error: message }
  }
}

/**
 * Move prediction: get the engine's top candidate moves for a position.
 */
export async function getSuggestedMoves(fen, { numMoves = 3, depth = 15 } = {}) {
  return postJSON('/api/analyze', { fen, num_moves: numMoves, depth })
}

/**
 * Win prediction: get a win% for the current position.
 */
export async function getWinProbability(fen, { depth = 15 } = {}) {
  return postJSON('/api/win-probability', { fen, depth })
}

/**
 * Win prediction via the TRAINED model (XGBoost, fit on ~75K positions
 * sampled from ~20K real Lichess games). Optionally pass white/black
 * ratings -- this is the one input the formula-based endpoint above has
 * no way to use at all, and it noticeably changes the model's output.
 */
export async function getMLWinProbability(fen, { whiteRating = null, blackRating = null } = {}) {
  return postJSON('/api/win-probability-ml', {
    fen,
    white_rating: whiteRating,
    black_rating: blackRating,
  })
}

/**
 * Game analysis: classify every move in a game (best/good/inaccuracy/
 * mistake/blunder) and get an overall summary.
 */
export async function analyzeGame(moves, { startingFen = null, depth = 12 } = {}) {
  return postJSON('/api/analyze-game', { moves, starting_fen: startingFen, depth })
}
