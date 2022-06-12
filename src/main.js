import { normalizeAggregate } from './aggregate.js'
import { normalizeCause } from './cause.js'
import { createError } from './create.js'
import { setErrorProperty, normalizeEnumerableProps } from './descriptors.js'
import { setFullStack, fixStack } from './stack.js'

// Ensure an exception is an Error instance with normal properties
export default function normalizeException(error) {
  return recurseException(error, [])
}

const recurseException = function (error, parents) {
  if (parents.includes(error)) {
    return
  }

  const recurse = (innerError) =>
    recurseException(innerError, [...parents, error])

  const errorA = createError(error)
  normalizeProps(errorA, recurse)
  return errorA
}

const normalizeProps = function (error, recurse) {
  normalizeName(error)
  normalizeMessage(error)
  normalizeStack(error)
  normalizeCause(error, recurse)
  normalizeAggregate(error, recurse)
  normalizeEnumerableProps(error)
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
  if (isDefinedString(error.stack)) {
    fixStack(error)
  } else {
    setFullStack(error)
  }
}

const isDefinedString = function (value) {
  return typeof value === 'string' && value !== ''
}
