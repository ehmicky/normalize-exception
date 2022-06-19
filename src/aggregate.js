import { setErrorProperty } from './descriptors.js'

// Recurse over `error.errors`.
// Also ensure `AggregateError` instance have an `errors` property.
// Skip `error.errors` that are infinitely recursive.
// We filter out `undefined` `errors` for the same reason we remove `undefined`
// `error.cause`.
export const normalizeAggregate = function (error, recurse) {
  if (Array.isArray(error.errors)) {
    const aggregateErrors = error.errors
      .filter(isDefined)
      .map(recurse)
      .filter(Boolean)
    setErrorProperty(error, 'errors', aggregateErrors)
  } else if (isAggregateError(error)) {
    setErrorProperty(error, 'errors', [])
  } else if (error.errors !== undefined) {
    // eslint-disable-next-line fp/no-delete
    delete error.errors
  }
}

const isDefined = function (error) {
  return error !== undefined
}

const isAggregateError = function (error) {
  return (
    'AggregateError' in globalThis &&
    (error.name === 'AggregateError' || error instanceof AggregateError)
  )
}
