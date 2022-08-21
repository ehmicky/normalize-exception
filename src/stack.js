import { setErrorProperty } from './descriptors.js'

// Create stack trace if missing.
// We do not try to fix `error.stack`, e.g. to ensure it contains `error.name`
// and `error.message` since:
//  - `error.stack` is not standard and differs between engines
//  - `error.stack` is often instrumented
//     - e.g. `--enable-source-maps` CLI flag with Node.js adds inline previews
export const setStack = function (error) {
  const stack = getStack(error.message, error.name)
  setErrorProperty(error, 'stack', stack)
}

// Generate a new stack trace.
// Does not assume `error.stack` format.
// `error.stack` can be `undefined` in edge case, e.g. overridden `Error`
// global object or deleting `Error.stackTraceLimit`.
const getStack = function (message = '', name = 'Error') {
  const StackError = getErrorClass(name)
  const { stack } = new StackError(message)
  return stack === undefined || stack === ''
    ? `${name}: ${message}`
    : stack.split('\n').filter(isNotInternalLine).join('\n')
}

// Creates a temporary error class to ensure the `name` is present in the stack
const getErrorClass = function (name) {
  // eslint-disable-next-line fp/no-class
  class StackError extends Error {}
  const descriptor = {
    value: name,
    enumerable: true,
    writable: true,
    configurable: true,
  }
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(StackError, 'name', descriptor)
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(StackError.prototype, 'name', descriptor)
  return StackError
}

const isNotInternalLine = function (line) {
  return !line.includes(INTERNAL_LINE)
}

// How the top-level function appears in a stack trace.
// Since stack traces are implementation-specific, we must be very conservative
// and careful.
const INTERNAL_LINE = 'normalize-exception'
