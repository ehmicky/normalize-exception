import { setErrorProperty } from './descriptors.js'

// Recurse over `error.cause`.
// Skip `error.cause` if infinitely recursive.
// `new Error('message', { cause: undefined })` can happen either because:
//  - the inner error was `undefined`
//  - the cause was optional, or intentionally set to `undefined` to mean
//    "no cause"
// We interpret in the second way:
//  - This is more common.
//  - `undefined` exceptions have no stack trace nor message, so not very
//    useful anyway, except to indicate that an `undefined` value was thrown
//    from somewhere else
export const normalizeCause = function (error, recurse) {
  if (!('cause' in error)) {
    return
  }

  const cause = error.cause === undefined ? error.cause : recurse(error.cause)

  if (cause === undefined) {
    // eslint-disable-next-line fp/no-delete
    delete error.cause
  } else {
    setErrorProperty(error, 'cause', cause)
  }
}
