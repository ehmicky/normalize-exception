import { createError } from './create.js'
import { setErrorProperty } from './set.js'
import { setFullStack, getStackHeader, fixStack } from './stack.js'

// Ensure an exception is an Error instance with normal properties
export default function normalizeException(error) {
  return recurseException(error, [])
}

const recurseException = function (error, parents) {
  if (parents.includes(error)) {
    return
  }

  const parentsA = [...parents, error]
  const errorA = error instanceof Error ? error : createError(error)
  normalizeName(errorA)
  normalizeMessage(errorA)
  normalizeStack(errorA)
  normalizeCause(errorA, parentsA)
  normalizeAggregate(errorA, parentsA)
  return errorA
}

// Ensure `error.name` is a string
const normalizeName = function (error) {
  if (!isDefinedString(error.name)) {
    const name = isDefinedString(error.constructor.name)
      ? error.constructor.name
      : 'Error'
    setErrorProperty(error, 'name', name)
  }
}

// Ensure `error.message` is a string
const normalizeMessage = function (error) {
  if (!isDefinedString(error.message)) {
    setErrorProperty(error, 'message', '')
  }
}

// Ensure `error.stack` exists and looks normal
const normalizeStack = function (error) {
  if (!isDefinedString(error.stack)) {
    setFullStack(error)
  }

  const header = getStackHeader(error)

  if (!error.stack.startsWith(header)) {
    fixStack(error, header)
  }
}

const isDefinedString = function (value) {
  return typeof value === 'string' && value !== ''
}

// Recurse over `error.cause`.
// Skip `error.cause` if infinitely recursive.
// `new Error('message', { cause: undefined })` can happen either because:
//  - the inner error was `undefined`
//  - the cause was optional
// We interpret in the second way, which might be more common.
const normalizeCause = function (error, parents) {
  if (!('cause' in error)) {
    return
  }

  const cause =
    error.cause === undefined
      ? error.cause
      : recurseException(error.cause, parents)

  if (cause === undefined) {
    // eslint-disable-next-line fp/no-delete
    delete error.cause
  } else {
    setErrorProperty(error, 'cause', cause)
  }
}

// Recurse over `error.errors`.
// Also ensure `AggregateError` instance have an `errors` property.
// Skip `error.errors` that are infinitely recursive.
const normalizeAggregate = function (error, parents) {
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
