import { describe, expect, it } from 'vitest'
import { CalculatorError, evaluateExpression, formatResult, removeLastCharacter } from './calculator'

describe('evaluateExpression', () => {
  it('respects parentheses and operator precedence', () => {
    expect(evaluateExpression('2 + 3 * 4')).toBe(14)
    expect(evaluateExpression('(2 + 3) * 4')).toBe(20)
  })

  it('supports decimals, negative values, and percentages', () => {
    expect(evaluateExpression('10.5 - 2.25')).toBe(8.25)
    expect(evaluateExpression('-8 / 2')).toBe(-4)
    expect(evaluateExpression('50% * 200')).toBe(100)
  })

  it('rejects division by zero', () => {
    expect(() => evaluateExpression('8 / 0')).toThrowError('Cannot divide by zero')
  })

  it('rejects invalid operators and bracket structures', () => {
    expect(() => evaluateExpression('2 ++ 3')).toThrow(CalculatorError)
    expect(() => evaluateExpression('(2 + 3')).toThrowError('Unbalanced brackets')
    expect(() => evaluateExpression('2 + 3)')).toThrowError('Unbalanced brackets')
    expect(() => evaluateExpression('2..4')).toThrowError('Invalid number')
  })

  it('formats floating point results for display', () => {
    expect(formatResult(0.1 + 0.2)).toBe('0.3')
    expect(formatResult(-0)).toBe('0')
  })

  it('removes one character for backspace behavior', () => {
    expect(removeLastCharacter('12.50')).toBe('12.5')
    expect(removeLastCharacter('')).toBe('')
  })
})
