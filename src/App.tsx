import { useEffect, useState } from 'react'
import { Calculator } from './components/Calculator'
import { History, type HistoryItem } from './components/History'

// Default empty history list used when no saved entries are available.
const fallbackHistory: HistoryItem[] = []

export default function App() {
  // Store all calculation history entries shown in the UI.
  const [history, setHistory] = useState<HistoryItem[]>(fallbackHistory)

  // Controls whether the mobile history panel is open.
  const [historyOpen, setHistoryOpen] = useState(false)

  // Tracks the expression selected from the history list.
  const [selectedExpression, setSelectedExpression] = useState('')

  // Load history from the backend when the app starts.
  // If the backend is unavailable, use browser local storage as a fallback.
  useEffect(() => {
    fetch('/api/history')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('History unavailable')))
      .then((items: HistoryItem[]) => setHistory(items))
      .catch(() => {
        const stored = window.localStorage.getItem('calculator-history')
        if (stored) setHistory(JSON.parse(stored) as HistoryItem[])
      })
  }, [])

  // Add a new calculation to the history list and save it to the backend.
  const addHistory = (item: HistoryItem) => {
    setHistory((current) => {
      const next = [item, ...current.filter((entry) => entry.expression !== item.expression)].slice(0, 20)
      window.localStorage.setItem('calculator-history', JSON.stringify(next))
      return next
    })
    void fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
  }

  // Remove all entries from history and clear the saved server data.
  const clearHistory = () => {
    setHistory([])
    window.localStorage.removeItem('calculator-history')
    void fetch('/api/history', { method: 'DELETE' })
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Simple Calculator home">
          <span className="brand-mark">+</span>
          <span>Simple<span className="brand-light">Calculator</span></span>
        </a>

        {/* Toggle button for the history panel. */}
        <button className="history-toggle" onClick={() => setHistoryOpen((open) => !open)}>
          <span className="toggle-icon">↺</span> History {history.length > 0 && <span className="history-count">{history.length}</span>}
        </button>
      </header>

      <div className="workspace">
        {/* Main calculator section. */}
        <Calculator onCalculated={addHistory} selectedExpression={selectedExpression} />

        {/* History sidebar for previous calculations. */}
        <History items={history} onSelect={(item) => setSelectedExpression(item.expression)} onClear={clearHistory} />
      </div>

      {/* Show a smaller history panel on mobile screens. */}
      {historyOpen && <div className="mobile-history"><History items={history} onSelect={(item) => { setSelectedExpression(item.expression); setHistoryOpen(false) }} onClear={clearHistory} /></div>}
    </main>
  )
}
