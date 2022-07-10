// Ensure error properties are writable and non-enumerable
export const normalizeDescriptors = function (error) {
  CORE_ERROR_PROPS.forEach((propName) => {
    normalizeDescriptor(error, propName)
  })
}

export const CORE_ERROR_PROPS = ['name', 'message', 'stack', 'cause', 'errors']

const normalizeDescriptor = function (error, propName) {
  const descriptor = getDescriptor(error, propName)

  if (descriptor === undefined) {
    return
  }

  if (isReadonlyGetter(descriptor)) {
    setErrorProperty(error, propName, error[propName])
    return
  }

  if (isInvalidDescriptor(descriptor)) {
    setErrorDescriptor(error, propName, descriptor)
  }
}

// `Error.name` is usually on the prototype, i.e. it is not an own property
export const getDescriptor = function (value, propName) {
  const descriptor = Object.getOwnPropertyDescriptor(value, propName)

  if (descriptor !== undefined) {
    return descriptor
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === null ? undefined : getDescriptor(prototype, propName)
}

// Getters are allowed, but not readonly
const isReadonlyGetter = function ({ get, set }) {
  return get !== undefined && set === undefined
}

const isInvalidDescriptor = function ({ enumerable, writable }) {
  return enumerable || !writable
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
    ...('get' in descriptor || 'set' in descriptor ? {} : { writable: true }),
    enumerable: false,
    configurable: true,
  })
}
