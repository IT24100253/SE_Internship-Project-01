// Data structure for one saved calculation in the history list.
export type HistoryItem = {
  id: string
  expression: string
  result: string
  createdAt: number
}

// Props used by the history panel component.
type HistoryProps = {
  items: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onClear: () => void
}

export function History({ items, onSelect, onClear }: HistoryProps) {
  return (
    <aside className="history-panel" aria-label="Calculation history">
      <div className="history-heading">
        <div>
          <span className="eyebrow">Archive</span>
          <h2>History</h2>
        </div>

        {/* Show clear button only when history contains entries. */}
        {items.length > 0 && <button className="text-button" onClick={onClear}>Clear all</button>}
      </div>

      {items.length === 0 ? (
        // Empty state shown before any calculation has been saved.
        <div className="history-empty">
          <span className="history-empty-mark">⌁</span>
          <p>Your calculations will appear here.</p>
        </div>
      ) : (
        // Display each saved calculation as a clickable item.
        <div className="history-list">
          {items.map((item) => (
            <button className="history-item" key={item.id} onClick={() => onSelect(item)}>
              <span className="history-expression">{item.expression}</span>
              <strong>= {item.result}</strong>
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
