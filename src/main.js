import { normalizeAggregate } from './aggregate/main.js'
import { normalizeCause } from './cause.js'
import { createError } from './create/main.js'
import { setErrorProperty, normalizeDescriptors } from './descriptors.js'
import { setStack } from './stack.js'

// Ensure an exception is an Error instance with normal properties
export default function normalizeException(error, { shallow = false } = {}) {
  return recurseException(error, [], shallow)
}

const recurseException = function (error, parents, shallow) {
  if (parents.includes(error)) {
    return
  }

  const recurse = shallow
    ? identity
    : (innerError) => recurseException(innerError, [...parents, error], shallow)

  const errorA = createError(error)
  normalizeProps(errorA, recurse)
  return errorA
}

const identity = function (error) {
  return error
}

const normalizeProps = function (error, recurse) {
  normalizeName(error)
  normalizeMessage(error)
  normalizeStack(error)
  normalizeCause(error, recurse)
  normalizeAggregate(error, recurse)
  normalizeDescriptors(error)
}

// Ensure `error.name` is a string.
// We do not ensure that `error.name`, `error.__proto__.name` and
// `error.constructor.name` match
//  - Although this is best practice, this is often not the case and changing
//    it might break some logic
const normalizeName = function (error) {
  if (isDefinedString(error.name)) {
    return
  }

  const prototypeName = Object.getPrototypeOf(error).name
  const name = isDefinedString(prototypeName)
    ? prototypeName
    : error.constructor.name
  setErrorProperty(error, 'name', name)
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
    setStack(error)
  }
}

const isDefinedString = function (value) {
  return typeof value === 'string' && value !== ''
}
