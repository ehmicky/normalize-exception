// Ensure error properties are writable and non-enumerable
export const normalizeDescriptors = (error) => {
  CORE_ERROR_PROPS.forEach((propName) => {
    normalizeDescriptor(error, propName)
  })
}

export const CORE_ERROR_PROPS = ['name', 'message', 'stack', 'cause', 'errors']

const normalizeDescriptor = (error, propName) => {
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
export const getDescriptor = (value, propName) => {
  const descriptor = Object.getOwnPropertyDescriptor(value, propName)

  if (descriptor !== undefined) {
    return descriptor
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === null ? undefined : getDescriptor(prototype, propName)
}

// Getters are allowed, but not readonly
const isReadonlyGetter = ({ get, set }) =>
  get !== undefined && set === undefined

const isInvalidDescriptor = ({ enumerable, writable }) =>
  enumerable || !writable

// Error properties are writable and non-enumerable
export const setErrorProperty = (error, propName, value) => {
  setErrorDescriptor(error, propName, { value })
}

// Handle properties which are getters|setters
const setErrorDescriptor = (error, propName, descriptor) => {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, propName, {
    ...descriptor,
    ...('get' in descriptor || 'set' in descriptor ? {} : { writable: true }),
    enumerable: false,
    configurable: true,
  })
}
