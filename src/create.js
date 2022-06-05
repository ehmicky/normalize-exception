import { setErrorProperty } from './set.js'
import { setFullStack } from './stack.js'

// If an exception is not an Error instance, create one.
export const createError = function (value) {
  return isPlainObj(value) ? objectifyError(value) : stringifyError(value)
}

const isPlainObj = function (value) {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

// Handle errors that are plain objects instead of Error instances
const objectifyError = function ({
  name,
  message,
  stack,
  cause,
  errors,
  ...object
}) {
  const messageA = getMessage(message, object)
  const error = new Error(messageA)
  Object.entries({ name, stack, cause, errors }).forEach(
    ([propName, propValue]) => {
      setNewErrorProperty(error, propName, propValue)
    },
  )

  if (stack === undefined) {
    setFullStack(error)
  }

  return error
}

const getMessage = function (message, object) {
  return typeof message === 'string' && message !== ''
    ? message
    : jsonStringify(object)
}

// If no `message` property is defined, stringify the object.
// This might throw on self references.
const jsonStringify = function (object) {
  try {
    return JSON.stringify(object)
  } catch {
    return Object.keys(object).join(', ')
  }
}

const setNewErrorProperty = function (error, propName, propValue) {
  if (propValue !== undefined) {
    setErrorProperty(error, propName, propValue)
  }
}

// `String()` might throw due to `value.toString()`, so we handle it.
const stringifyError = function (value) {
  try {
    const error = new Error(String(value))
    setFullStack(error)
    return error
  } catch (error_) {
    return error_
  }
}
