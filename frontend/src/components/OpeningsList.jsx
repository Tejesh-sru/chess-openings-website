import React, { useState } from 'react'
import openings from '../data/openings.json'

export default function OpeningsList({ onSelectOpening }) {
  const [query, setQuery] = useState('')

  const filtered = openings.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase()) ||
    (o.eco && o.eco.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="panel">
      <div className="mb-3 d-flex">
        <input
          className="form-control me-2"
          placeholder="Search openings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div>
        {filtered.map((o) => (
          <div key={o.id} className="opening-card p-2 mb-2 border rounded">
            <div className="d-flex justify-content-between align-items-center">
              <div style={{flex:1}} onClick={() => onSelectOpening(o)}>
                <strong>{o.name}</strong>
                <div className="text-muted small">{o.eco}</div>
              </div>

              <div className="text-muted small me-3">{o.moves.join(' ')}</div>

              <div>
                <button className="btn btn-sm btn-outline-primary" onClick={() => onSelectOpening(o)}>Load</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
