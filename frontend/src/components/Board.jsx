import React, { useEffect, useState, useRef, useLayoutEffect, forwardRef, useImperativeHandle } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'

const Board = forwardRef(({ opening, initialFen = null, mode = 'play', puzzleSolution = null }, ref) => {
  const containerRef = useRef(null)
  const chessRef = useRef(new Chess())
  const [fen, setFen] = useState(chessRef.current.fen())
  const [history, setHistory] = useState([])
  const [openingMoves, setOpeningMoves] = useState([])
  const [moveIndex, setMoveIndex] = useState(-1)
  const [boardWidth, setBoardWidth] = useState(480)
  const [orientation, setOrientation] = useState('white')
  const [status, setStatus] = useState('')
  const [redoStack, setRedoStack] = useState([])
  const [puzzleStep, setPuzzleStep] = useState(0)

  useImperativeHandle(ref, () => ({
    getHistory: () => history,
    getFen: () => fen,
  }), [history, fen])

  useEffect(() => {
    // responsive board width
    function update() {
      const w = containerRef.current ? containerRef.current.clientWidth : 480
      setBoardWidth(Math.min(640, Math.max(240, Math.floor(w * 0.95))))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    // load an opening for stepping
    if (!opening) return
    const game = new Chess()
    chessRef.current = game
    setOpeningMoves(opening.moves || [])
    setMoveIndex(-1)
    setFen(game.fen())
    setHistory([])
    setStatus(`Loaded opening: ${opening.name}`)
  }, [opening])

  useEffect(() => {
    // load initial FEN (for puzzles)
    if (!initialFen) return
    const game = new Chess(initialFen)
    chessRef.current = game
    setFen(game.fen())
    setHistory(game.history())
    setStatus('Loaded position')
    setPuzzleStep(0)
  }, [initialFen])

  function applyMoveSAN(san) {
    const game = chessRef.current
    try {
      const mv = game.move(san)
      if (!mv) return false
      setFen(game.fen())
      setHistory(game.history())
      return mv
    } catch (e) {
      return false
    }
  }

  function stepForward() {
    if (!openingMoves || moveIndex >= openingMoves.length - 1) return
    const next = openingMoves[moveIndex + 1]
    const game = chessRef.current
    const mv = game.move(next)
    if (!mv) {
      setStatus('Invalid opening move')
      return
    }
    setMoveIndex(moveIndex + 1)
    setFen(game.fen())
    setHistory(game.history())
  }

  function stepBack() {
    const game = chessRef.current
    if (moveIndex < 0 && game.history().length === 0) return
    game.undo()
    setMoveIndex(Math.max(-1, moveIndex - 1))
    setFen(game.fen())
    setHistory(game.history())
  }

  function reset() {
    const game = new Chess()
    chessRef.current = game
    setOpeningMoves([])
    setMoveIndex(-1)
    setFen(game.fen())
    setHistory([])
    setRedoStack([])
    setStatus('Reset to initial position')
    setPuzzleStep(0)
  }

  function undo() {
    const game = chessRef.current
    const last = game.history().pop()
    if (!last) return
    const mv = game.undo()
    if (!mv) return
    setRedoStack((r) => [mv, ...r])
    setFen(game.fen())
    setHistory(game.history())
  }

  function redo() {
    const game = chessRef.current
    if (!redoStack.length) return
    const next = redoStack[0]
    const mv = game.move(next)
    if (!mv) return
    setRedoStack((r) => r.slice(1))
    setFen(game.fen())
    setHistory(game.history())
  }

  function exportPgn() {
    try {
      const pgn = chessRef.current.pgn()
      navigator.clipboard.writeText(pgn)
      setStatus('PGN copied to clipboard')
    } catch (e) {
      setStatus('Failed to copy PGN')
    }
  }

  function toggleOrientation() {
    setOrientation((o) => (o === 'white' ? 'black' : 'white'))
  }

  function onPieceDrop(sourceSquare, targetSquare) {
    const game = chessRef.current

    // Puzzle mode: validate against puzzle solution
    if (mode === 'puzzle' && puzzleSolution) {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
      if (!move) {
        setStatus('Illegal move')
        return false
      }
      const expected = puzzleSolution[puzzleStep]
      // compare SANs loosely (ignore trailing +/#)
      const sanit = (s) => s.replace(/[+#]/g, '').trim()
      if (sanit(move.san) === sanit(expected)) {
        setPuzzleStep((s) => s + 1)
        setFen(game.fen())
        setHistory(game.history())
        if (puzzleStep + 1 >= puzzleSolution.length) {
          setStatus('Puzzle solved! ✅')
        } else {
          setStatus('Correct, continue...')
        }
        return true
      } else {
        // wrong move: undo and show message
        game.undo()
        setStatus('Wrong move — try again')
        return false
      }
    }

    // If we are stepping through an opening, disallow manual moves until stepping finishes
    if (openingMoves && openingMoves.length && moveIndex < openingMoves.length - 1) {
      setStatus('Step through the opening first or reset to play freely')
      return false
    }

    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    if (move === null) return false
    // playing interactively clears redo stack
    setRedoStack([])
    setFen(game.fen())
    setHistory(game.history())
    return true
  }

  return (
    <div className="panel" ref={containerRef}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>Board</strong>
        <div>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={reset}>Reset</button>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={undo}>Undo</button>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={redo}>Redo</button>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={exportPgn}>Export PGN</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={toggleOrientation}>Flip</button>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row gap-3">
        <div>
          <Chessboard
            position={fen}
            onPieceDrop={onPieceDrop}
            boardWidth={boardWidth}
            orientation={orientation}
          />
        </div>

        <div style={{ minWidth: 200 }}>
          <div className="mb-2 d-flex gap-2">
            <button className="btn btn-sm btn-outline-primary" onClick={stepBack}>◀ Prev</button>
            <button className="btn btn-sm btn-outline-primary" onClick={stepForward}>Next ▶</button>
          </div>

          <h6>Moves</h6>
          <ol style={{ maxHeight: 280, overflow: 'auto' }}>
            {history.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ol>

          <div className="mt-3 text-muted small">
            <div><strong>FEN:</strong> <code style={{wordBreak:'break-all'}}>{fen}</code></div>
            <div className="mt-1">{status}</div>
          </div>
        </div>
      </div>
    </div>
  )
})

Board.displayName = 'Board'
export default Board
