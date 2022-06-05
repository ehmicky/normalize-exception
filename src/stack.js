import { setErrorProperty } from './set.js'

// Ensure `error.stack` reflects `error.name` and `error.message`
// Also create stack trace if missing.
export const setFullStack = function (error) {
  const stack = `${getStackHeader(error)}\n${getStackTrace()}`
  setErrorProperty(error, 'stack', stack)
}

// Expected first line of `error.stack`
export const getStackHeader = function (error) {
  return `${error.name}: ${error.message}`
}

// Ensure `error.stack` reflects `error.name` and `error.message`
export const fixStack = function (error, header) {
  const lines = error.stack.split('\n')
  const index = lines.findIndex(isStackLine)
  const linesA = index === -1 ? [getStackTrace()] : lines.slice(index)
  const stack = [header, ...linesA].join('\n')
  setErrorProperty(error, 'stack', stack)
}

const isStackLine = function (line) {
  return STACK_LINE_REGEXP.test(line)
}

const STACK_LINE_REGEXP = /^\s*at /u

// Generate a new stack trace
const getStackTrace = function () {
  // eslint-disable-next-line unicorn/error-message
  const lines = new Error('').stack.split('\n')
  const index = findInternalIndex(lines)
  return lines.slice(index).join('\n')
}

// Remove stack lines due to this library itself.
// `index` should never be `-1`, but we include this as a failsafe.
// The stack trace might be truncated, e.g. due to `Error.stackTraceLimit` in
// Node.js, leading to the whole stack to be removed. In that case, we keep the
// last stack line.
const findInternalIndex = function (lines) {
  const index = findLastIndex(lines, isInternalStackLine)

  if (index === -1) {
    return 1
  }

  return lines.length - 1 === index ? index : index + 1
}

// TODO: use `Array.findLastIndex()` after dropping support for Node <18
const findLastIndex = function (array, condition) {
  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = array.length - 1; index >= 0; index -= 1) {
    // eslint-disable-next-line max-depth
    if (condition(array[index])) {
      return index
    }
  }

  return -1
}

const isInternalStackLine = function (line) {
  return line.includes(NORMALIZE_ERROR_LINE)
}

// How the top-level function appears in a stack trace.
// Since stack traces are implementation-specific, we must be very conservative
// and careful. Also, we must ensure transpilation does not change this.
const NORMALIZE_ERROR_LINE = 'at normalizeError'
