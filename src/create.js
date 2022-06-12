import { supportsAggregateError } from './aggregate.js'
import { setErrorProperty, isNonModifiableError } from './enumerable.js'
import { setFullStack } from './stack.js'
import { isPlainObj } from './utils.js'

// If an exception is not an Error instance, create one.
export const createError = function (value) {
  if (isPlainObj(value)) {
    return objectifyError(value)
  }

  if (!isError(value)) {
    return stringifyError(value)
  }

  if (isNonModifiableError(value)) {
    return objectifyError(value)
  }

  return value
}

// Unlike `instanceof Error`, this works cross-realm,
// e.g. `vm.runInNewContext('Error')`
// Edge causes `{ [Symbol.toStringTag]: 'Error' }` is handled by `is-plain-obj`
const isError = function (value) {
  return objectToString.call(value) === '[object Error]'
}

const { toString: objectToString } = Object.prototype

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
  const error = newError(name, messageA)

  if (message === messageA) {
    // eslint-disable-next-line fp/no-mutating-assign
    Object.assign(error, object)
  }

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

const newError = function (name, message) {
  if (name === 'AggregateError' && supportsAggregateError()) {
    return new AggregateError([], message)
  }

  if (name in NATIVE_ERRORS) {
    return new NATIVE_ERRORS[name](message)
  }

  return new Error(message)
}

const NATIVE_ERRORS = {
  Error,
  ReferenceError,
  TypeError,
  SyntaxError,
  RangeError,
  URIError,
  EvalError,
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
