import { setErrorProperty } from './descriptors.js'

// Create stack trace if missing.
// We do not try to fix `error.stack`, e.g. to ensure it contains `error.name`
// and `error.message` since:
//  - `error.stack` is not standard and differs between engines
//  - `error.stack` is often instrumented
//     - e.g. `--enable-source-maps` CLI flag with Node.js adds inline previews
// On SpiderMonkey:
//  - `error.stack` is an inherited getter function
//  - The following shadows it with an own property
export const setStack = (error) => {
  const stack = getStack(error.message, error.name)
  setErrorProperty(error, 'stack', stack)
}

// Generate a new stack trace.
// Does not assume `error.stack` format.
// `error.stack` can be `undefined` in edge case, e.g. overridden `Error`
// global object or deleting `Error.stackTraceLimit`.
// We do not remove stack lines of `normalize-exception` itself, as it helps
// users understand where the error was created.
const getStack = (message = '', name = 'Error') => {
  const StackError = getErrorClass(name)
  const { stack } = new StackError(message)
  return typeof stack === 'string' && stack !== ''
    ? stack
    : `${name}: ${message}`
}

// Creates a temporary error class to ensure the `name` is present in the stack
// SpiderMonkey includes the constructor in `error.stack`.
//  - Also it uses the constructor `Function.name` at function creation time
//  - This requires creating an anonymous class and not assigning to a variable
const getErrorClass = (name) => {
  const descriptor = {
    value: name,
    enumerable: false,
    writable: true,
    configurable: true,
  }
  const StackError = Object.defineProperty(
    class extends Error {},
    'name',
    descriptor,
  )
  Object.defineProperty(StackError.prototype, 'name', descriptor)
  return StackError
}
