// Ensure error properties are non-enumerable
export const normalizeEnumerableProps = function (error) {
  NON_ENUMERABLE_PROPS.forEach((propName) => {
    normalizeEnumerableProp(error, propName)
  })
}

const NON_ENUMERABLE_PROPS = ['name', 'message', 'stack', 'cause', 'errors']

const normalizeEnumerableProp = function (error, propName) {
  const descriptor = getDescriptor(error, propName)

  if (
    descriptor !== undefined &&
    descriptor.enumerable &&
    descriptor.configurable
  ) {
    setErrorProperty(error, propName, descriptor.value)
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

// Error properties are non-enumerable
export const setErrorProperty = function (error, propName, value) {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, propName, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
  })
}
