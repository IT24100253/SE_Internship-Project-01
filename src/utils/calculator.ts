// Custom error used when an expression is invalid or impossible to compute.
export class CalculatorError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CalculatorError'
  }
}

// Token types used by the expression parser.
type Token =
  | { type: 'number'; value: number }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'leftParen' }
  | { type: 'rightParen' }
  | { type: 'percent' }

type ParserState = { tokens: Token[]; position: number }

// Convert an expression string into tokens for parsing.
function tokenize(expression: string): Token[] {
  const tokens: Token[] = []
  let index = 0
  let expectsValue = true

  while (index < expression.length) {
    const character = expression[index]
    if (/\s/.test(character)) {
      index += 1
      continue
    }

    if (/[0-9.]/.test(character)) {
      const start = index
      let decimalCount = 0
      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        if (expression[index] === '.') decimalCount += 1
        index += 1
      }
      const rawNumber = expression.slice(start, index)
      if (decimalCount > 1 || rawNumber === '.') {
        throw new CalculatorError('Invalid number')
      }
      const value = Number(rawNumber)
      if (!Number.isFinite(value)) throw new CalculatorError('Invalid number')
      tokens.push({ type: 'number', value })
      expectsValue = false
      continue
    }

    if (character === '(') {
      if (!expectsValue) throw new CalculatorError('Missing operator')
      tokens.push({ type: 'leftParen' })
      index += 1
      expectsValue = true
      continue
    }

    if (character === ')') {
      if (expectsValue) throw new CalculatorError('Invalid expression')
      tokens.push({ type: 'rightParen' })
      index += 1
      expectsValue = false
      continue
    }

    if (character === '%') {
      if (expectsValue) throw new CalculatorError('Invalid percentage')
      tokens.push({ type: 'percent' })
      index += 1
      continue
    }

    if ('+-*/×÷'.includes(character)) {
      const normalized = character === '×' ? '*' : character === '÷' ? '/' : character
      if (expectsValue && normalized !== '-') throw new CalculatorError('Invalid operator placement')
      tokens.push({ type: 'operator', value: normalized as '+' | '-' | '*' | '/' })
      index += 1
      expectsValue = true
      continue
    }

    throw new CalculatorError('Unsupported character')
  }

  if (tokens.length === 0 || expectsValue) throw new CalculatorError('Incomplete expression')
  return tokens
}

// Parse addition and subtraction expressions.
function parseExpression(state: ParserState): number {
  let value = parseTerm(state)
  while (state.position < state.tokens.length) {
    const token = state.tokens[state.position]
    if (token.type !== 'operator' || !['+', '-'].includes(token.value)) break
    state.position += 1
    const right = parseTerm(state)
    value = token.value === '+' ? value + right : value - right
  }
  return value
}

// Parse multiplication and division expressions.
function parseTerm(state: ParserState): number {
  let value = parseUnary(state)
  while (state.position < state.tokens.length) {
    const token = state.tokens[state.position]
    if (token.type !== 'operator' || !['*', '/'].includes(token.value)) break
    state.position += 1
    const right = parseUnary(state)
    if (token.value === '/' && right === 0) throw new CalculatorError('Cannot divide by zero')
    value = token.value === '*' ? value * right : value / right
  }
  return value
}

// Parse values with unary minus support, such as -5 or -(2+3).
function parseUnary(state: ParserState): number {
  const token = state.tokens[state.position]
  if (token?.type === 'operator' && token.value === '-') {
    state.position += 1
    return -parseUnary(state)
  }
  return parsePrimary(state)
}

// Parse a number, parenthesized expression, or percentage value.
function parsePrimary(state: ParserState): number {
  const token = state.tokens[state.position]
  let value: number

  if (token?.type === 'number') {
    value = token.value
    state.position += 1
  } else if (token?.type === 'leftParen') {
    state.position += 1
    value = parseExpression(state)
    if (state.tokens[state.position]?.type !== 'rightParen') throw new CalculatorError('Unbalanced brackets')
    state.position += 1
  } else {
    throw new CalculatorError('Invalid expression')
  }

  while (state.tokens[state.position]?.type === 'percent') {
    value /= 100
    state.position += 1
  }
  return value
}

// Evaluate a full expression and return the final result.
export function evaluateExpression(expression: string): number {
  const state: ParserState = { tokens: tokenize(expression), position: 0 }
  const result = parseExpression(state)

  if (state.position !== state.tokens.length) {
    if (state.tokens[state.position]?.type === 'rightParen') throw new CalculatorError('Unbalanced brackets')
    throw new CalculatorError('Invalid expression')
  }

  if (!Number.isFinite(result)) throw new CalculatorError('Result is too large')
  return result
}

// Convert a numeric result into a clean string for display.
export function formatResult(value: number): string {
  if (Object.is(value, -0)) return '0'
  return Number(value.toPrecision(12)).toString()
}

// Remove the last character from the current expression.
export function removeLastCharacter(expression: string): string {
  return expression.slice(0, -1)
}
