import safeJsonValue from 'safe-json-value'

import { setErrorProperty } from '../descriptors.js'
import { setFullStack } from '../stack.js'

import { copyObject } from './copy.js'

// Handle errors that are plain objects instead of Error instances
export const objectifyError = function (object) {
  const { name, message, stack, cause, errors, ...objectA } = copyObject(object)
  const messageA = getMessage(message, objectA)
  const error = newError(name, messageA)

  if (message === messageA) {
    assignObjectProps(error, objectA)
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

// If no `message` property is defined, stringify the object.
const getMessage = function (message, object) {
  if (typeof message === 'string' && message !== '') {
    return message
  }

  const { value } = safeJsonValue(object, { maxSize: MESSAGE_MAX_SIZE })
  return JSON.stringify(value)
}

const MESSAGE_MAX_SIZE = 1e3

const newError = function (name, message) {
  if (name === 'AggregateError' && 'AggregateError' in globalThis) {
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

// We ensure prototype properties are not overridden
const assignObjectProps = function (error, object) {
  // eslint-disable-next-line fp/no-loops
  for (const propName in object) {
    // eslint-disable-next-line max-depth
    if (!(propName in error)) {
      error[propName] = object[propName]
    }
  }
}

const setNewErrorProperty = function (error, propName, propValue) {
  if (propValue !== undefined) {
    setErrorProperty(error, propName, propValue)
  }
}
