// If error cannot be modified, make it modifiable by cloning it
export const isNonModifiableError = function (error) {
  return (
    !Object.isExtensible(error) ||
    CORE_ERROR_PROPS.some((propName) => isNonConfigurableProp(error, propName))
  )
}

// Inherited properties are always configurable: using `Object.defineProperty()`
// creates an own property instead.
const isNonConfigurableProp = function (error, propName) {
  const descriptor = Object.getOwnPropertyDescriptor(error, propName)
  return descriptor !== undefined && !descriptor.configurable
}

// Ensure error properties are non-enumerable
export const normalizeEnumerableProps = function (error) {
  CORE_ERROR_PROPS.forEach((propName) => {
    normalizeEnumerableProp(error, propName)
  })
}

const CORE_ERROR_PROPS = ['name', 'message', 'stack', 'cause', 'errors']

const normalizeEnumerableProp = function (error, propName) {
  const descriptor = getDescriptor(error, propName)

  if (
    descriptor !== undefined &&
    (descriptor.enumerable || !descriptor.writable)
  ) {
    setErrorDescriptor(error, propName, descriptor)
  }
}

// `Error.name` is usually on the prototype, i.e. it is not an own property
const getDescriptor = function (value, propName) {
  const descriptor = Object.getOwnPropertyDescriptor(value, propName)

  if (descriptor !== undefined) {
    return descriptor
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === null ? undefined : getDescriptor(prototype, propName)
}

// Error properties are writable and non-enumerable
export const setErrorProperty = function (error, propName, value) {
  setErrorDescriptor(error, propName, { value })
}

// Handle properties which are getters|setters
const setErrorDescriptor = function (error, propName, descriptor) {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, propName, {
    ...descriptor,
    writable: true,
    enumerable: false,
    configurable: true,
  })
}
