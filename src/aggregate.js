import { setErrorProperty } from './set.js'

// Recurse over `error.errors`.
// Also ensure `AggregateError` instance have an `errors` property.
// Skip `error.errors` that are infinitely recursive.
export const normalizeAggregate = function (error, parents, recurseException) {
  if (Array.isArray(error.errors)) {
    const aggregateErrors = error.errors
      .map((aggregateError) => recurseException(aggregateError, parents))
      .filter(Boolean)
    setErrorProperty(error, 'errors', aggregateErrors)
  } else if (isAggregateError(error)) {
    setErrorProperty(error, 'errors', [])
  } else if (error.errors !== undefined) {
    // eslint-disable-next-line fp/no-delete
    delete error.errors
  }
}

// `AggregateError` is not available in Node <15.0.0 and in some browsers
const isAggregateError = function (error) {
  try {
    return error instanceof AggregateError
  } catch {
    return false
  }
}
