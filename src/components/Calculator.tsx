import { useEffect, useState } from 'react'
import { CalculatorError, evaluateExpression, formatResult, removeLastCharacter } from '../utils/calculator'
import type { HistoryItem } from './History'

// All calculator buttons displayed on the UI.
const buttons = [
  { label: 'AC', value: 'clear', kind: 'utility' },
  { label: '(', value: '(', kind: 'utility' },
  { label: ')', value: ')', kind: 'utility' },
  { label: '⌫', value: 'backspace', kind: 'utility' },
  { label: '7', value: '7', kind: 'number' },
  { label: '8', value: '8', kind: 'number' },
  { label: '9', value: '9', kind: 'number' },
  { label: '÷', value: '÷', kind: 'operator' },
  { label: '4', value: '4', kind: 'number' },
  { label: '5', value: '5', kind: 'number' },
  { label: '6', value: '6', kind: 'number' },
  { label: '×', value: '×', kind: 'operator' },
  { label: '1', value: '1', kind: 'number' },
  { label: '2', value: '2', kind: 'number' },
  { label: '3', value: '3', kind: 'number' },
  { label: '-', value: '-', kind: 'operator' },
  { label: '0', value: '0', kind: 'number' },
  { label: '.', value: '.', kind: 'number' },
  { label: '%', value: '%', kind: 'operator' },
  { label: '+', value: '+', kind: 'operator' },
  { label: '=', value: '=', kind: 'equals wide' },
] as const

// Props passed into the calculator component.
type CalculatorProps = {
  onCalculated: (item: HistoryItem) => void
  selectedExpression?: string
}

// Check whether a symbol is a math operator.
function isOperator(value: string) {
  return ['+', '-', '×', '÷'].includes(value)
}

export function Calculator({ onCalculated, selectedExpression }: CalculatorProps) {
  // Current mathematical expression being typed.
  const [expression, setExpression] = useState('')

  // Value shown on the display screen.
  const [display, setDisplay] = useState('0')

  // Error text for invalid calculations.
  const [error, setError] = useState('')

  // Tracks whether the last action was a calculation so the next input starts cleanly.
  const [justCalculated, setJustCalculated] = useState(false)

  // Add a new input to the expression and update the display.
  const append = (value: string) => {
    setError('')

    if (value === 'clear') {
      setExpression('')
      setDisplay('0')
      setJustCalculated(false)
      return
    }

    if (value === 'backspace') {
      const next = removeLastCharacter(expression)
      setExpression(next)
      setDisplay(next || '0')
      setJustCalculated(false)
      return
    }

    if (justCalculated && (/[0-9.]/.test(value) || value === '(')) {
      setExpression(value)
      setDisplay(value)
    } else {
      const last = expression.at(-1) ?? ''
      if (isOperator(value) && isOperator(last)) return
      if (value === '%' && (isOperator(last) || last === '%' || !expression)) return
      if (value === ')' && (isOperator(last) || last === '(' || !expression)) return
      setExpression((current) => current + value)
      setDisplay((current) => current === '0' && /[0-9]/.test(value) ? value : current + value)
    }

    setJustCalculated(false)
  }

  // Evaluate the current expression and save the result in history.
  const calculate = () => {
    if (!expression) return

    try {
      const result = formatResult(evaluateExpression(expression))
      setDisplay(result)
      setExpression(result)
      setJustCalculated(true)
      onCalculated({ id: crypto.randomUUID(), expression, result, createdAt: Date.now() })
      setError('')
    } catch (caught) {
      setError(caught instanceof CalculatorError ? caught.message : 'Unable to calculate')
    }
  }

  // Listen for keyboard input so users can type directly.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (/^[0-9.]$/.test(event.key)) append(event.key)
      else if (['+', '-', '*', '/'].includes(event.key)) append(event.key === '*' ? '×' : event.key === '/' ? '÷' : event.key)
      else if (event.key === '%') append('%')
      else if (event.key === '(' || event.key === ')') append(event.key)
      else if (event.key === 'Backspace') append('backspace')
      else if (event.key === 'Escape') append('clear')
      else if (event.key === 'Enter' || event.key === '=') calculate()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  // When a history item is selected, load its expression into the calculator.
  useEffect(() => {
    if (selectedExpression) {
      setExpression(selectedExpression)
      setDisplay(selectedExpression)
      setError('')
      setJustCalculated(false)
    }
  }, [selectedExpression])

  return (
    <section className="calculator" aria-label="Calculator">
      <div className="display-wrap">
        <span className="display-label">Expression</span>
        <div className="display-expression" aria-live="polite">{display}</div>
        <div className="display-status">{error || 'Ready when you are'}</div>
      </div>

      <div className="keypad">
        {buttons.map((button) => (
          <button
            className={['key', `key-${button.kind}`].join(' ')}
            key={button.value}
            onClick={() => (button.value === '=' ? calculate() : append(button.value))}
            aria-label={button.label === '⌫' ? 'Backspace' : button.label}
          >
            {button.label}
          </button>
        ))}
      </div>
    </section>
  )
}
