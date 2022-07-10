import isPlainObj from 'is-plain-obj'

import { isNonModifiableError } from './modifiable.js'
import { objectifyError } from './object.js'
import { stringifyError } from './string.js'

const { toString: objectToString } = Object.prototype

// If an exception is not an Error instance, create one.
export const createError = function (value) {
  if (isErrorPlainObj(value)) {
    return objectifyError(value)
  }

  if (!isError(value)) {
    return handleNonError(value)
  }

  if (isInvalidError(value)) {
    return objectifyError(value)
  }

  return value
}

// Handle hooks exceptions when `value` is a Proxy.
const isErrorPlainObj = function (value) {
  try {
    return isPlainObj(value)
  } catch {
    return false
  }
}

// Unlike `instanceof Error`, this works cross-realm,
// e.g. `vm.runInNewContext('Error')`.
// Handle hooks exceptions when `value` is a Proxy.
const isError = function (value) {
  try {
    return (
      objectToString.call(value) === '[object Error]' &&
      !(Symbol.toStringTag in value)
    )
  } catch {
    return false
  }
}

const handleNonError = function (value) {
  return isProxy(value) ? objectifyError(value) : stringifyError(value)
}

// Proxies of Errors are converted to non-proxies.
// This can only work within the same realm, because the only way to detect
// proxies is combining `Object.prototype.toString()` and `instanceof`.
// Handle hooks exceptions when `value` is a Proxy.
const isProxy = function (value) {
  try {
    return value instanceof Error
  } catch {
    return true
  }
}

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
