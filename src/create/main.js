import isPlainObj from 'is-plain-obj'

import { isNonModifiableError } from './modifiable.js'
import { objectifyError } from './object.js'
import { stringifyError } from './string.js'

// If an exception is not an Error instance, create one.
export const createError = function (value) {
  if (isPlainObj(value)) {
    return objectifyError(value)
  }

  if (!isError(value)) {
    return stringifyError(value)
  }

  if (isInvalidError(value)) {
    return objectifyError(value)
  }

  return value
}

// Unlike `instanceof Error`, this works cross-realm,
// e.g. `vm.runInNewContext('Error')`
const isError = function (value) {
  return (
    objectToString.call(value) === '[object Error]' &&
    !(Symbol.toStringTag in value)
  )
}

const { toString: objectToString } = Object.prototype

const isInvalidError = function (value) {
  return isNonModifiableError(value) || hasInvalidConstructor(value)
}

// `error.constructor.name` is often used for type checking, so we ensure it
// is normal
const hasInvalidConstructor = function (error) {
  return (
    typeof error.constructor !== 'function' ||
    typeof error.constructor.name !== 'string' ||
    error.constructor.name === ''
  )
}
