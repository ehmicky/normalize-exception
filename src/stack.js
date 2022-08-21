import { setErrorProperty } from './descriptors.js'

// Create stack trace if missing.
// We do not try to fix `error.stack`, e.g. to ensure it contains `error.name`
// and `error.message` since:
//  - `error.stack` is not standard and differs between engines
//  - `error.stack` is often instrumented
//     - e.g. `--enable-source-maps` CLI flag with Node.js adds inline previews
export const setStack = function (error) {
  const stack = [getStackHeader(error), ...getStackTrace()].join('\n')
  setErrorProperty(error, 'stack', stack)
}

// Expected first line of `error.stack`
// `--enable-source-maps` in Node.js prepends the inlined source code before
// that header. We make sure this is kept when possible.
const getStackHeader = function (error) {
  return `${error.name}: ${error.message}`
}

// Generate a new stack trace
// `error.stack` can be `undefined` in edge case, e.g. overridden `Error`
// global object or deleting `Error.stackTraceLimit`.
const getStackTrace = function () {
  const { stack = '' } = new Error(' ')
  const lines = stack === '' ? [] : stack.split('\n')
  const index = findInternalIndex(lines)
  return lines.slice(index)
}

// Remove stack lines due to this library itself.
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
// and careful. Also, we must ensure transpilation does not change this, nor
// that the top function name changes.
const NORMALIZE_ERROR_LINE = 'normalizeException'
