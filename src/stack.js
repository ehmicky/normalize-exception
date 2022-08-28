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
// We do not remove stack lines of `normalize-exception` itself, as it helps
// users understand where the error was created.
const getStack = function (message = '', name = 'Error') {
  const StackError = getErrorClass(name)
  const { stack } = new StackError(message)
  return stack === undefined || stack === '' ? `${name}: ${message}` : stack
}

// Creates a temporary error class to ensure the `name` is present in the stack
const getErrorClass = function (name) {
  // eslint-disable-next-line fp/no-class
  class StackError extends Error {}
  const descriptor = {
    value: name,
    enumerable: false,
    writable: true,
    configurable: true,
  }
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(StackError, 'name', descriptor)
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(StackError.prototype, 'name', descriptor)
  return StackError
}
