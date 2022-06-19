import { setErrorProperty } from '../descriptors.js'
import { setFullStack } from '../stack.js'

// Handle errors that are plain objects instead of Error instances
export const objectifyError = function ({
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
    assignObjectProps(error, object)
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

const setNewErrorProperty = function (error, propName, propValue) {
  if (propValue !== undefined) {
    setErrorProperty(error, propName, propValue)
  }
}
