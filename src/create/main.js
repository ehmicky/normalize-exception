import isErrorInstance from 'is-error-instance'
import isPlainObj from 'is-plain-obj'

import { isNonModifiableError } from './modifiable.js'
import { objectifyError } from './object.js'
import { stringifyError } from './string.js'

const { toString: objectToString } = Object.prototype

// If an exception is not an Error instance, create one.
export const createError = (value) => {
  if (isErrorPlainObj(value)) {
    return objectifyError(value)
  }

  if (!isErrorInstance(value)) {
    return stringifyError(value)
  }

  if (isInvalidError(value)) {
    return objectifyError(value)
  }

  return value
}

// Handle hooks exceptions when `value` is a Proxy.
const isErrorPlainObj = (value) => {
  try {
    return isPlainObj(value)
  } catch {
    return false
  }
}

const isInvalidError = (value) =>
  isProxy(value) || isNonModifiableError(value) || hasInvalidConstructor(value)

// Proxies of Errors are converted to non-proxies.
// This can only work within the same realm, because the only way to detect
// proxies is combining `Object.prototype.toString()` and `instanceof`.
const isProxy = (value) => {
  try {
    return objectToString.call(value) === '[object Object]'
  } catch {
    return true
  }
}

// `error.constructor` is often used for type checking, so we ensure it
// is normal.
const hasInvalidConstructor = (error) =>
  typeof error.constructor !== 'function' ||
  typeof error.constructor.name !== 'string' ||
  error.constructor.name === '' ||
  error.constructor.prototype !== Object.getPrototypeOf(error)
