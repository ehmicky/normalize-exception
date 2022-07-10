import { CORE_ERROR_PROPS, getDescriptor } from '../descriptors.js'

const { hasOwnProperty: hasOwn } = Object.prototype

// Shallow copy object to handle exceptions in getter properties or proxies.
// Include symbols.
// Keep descriptor (enumerability, etc.).
export const copyObject = function (object) {
  const objectCopy = {}

  // eslint-disable-next-line fp/no-loops
  for (const propName of getPropsToCopy(object)) {
    // eslint-disable-next-line max-depth
    try {
      const value = object[propName]
      const {
        enumerable,
        configurable,
        writable = true,
      } = getDescriptor(object, propName)
      // eslint-disable-next-line fp/no-mutating-methods
      Object.defineProperty(objectCopy, propName, {
        value,
        enumerable,
        configurable,
        writable,
      })
    } catch {}
  }

  return objectCopy
}

// Exclude inherited properties except for core error properties, since
// `error.name` is often inherited.
// Exclude non-enumerable properties except for core error properties.
const getPropsToCopy = function (object) {
  const propNames = getOwnKeys(object)

  // eslint-disable-next-line fp/no-loops
  for (const propName of CORE_ERROR_PROPS) {
    // eslint-disable-next-line max-depth
    if (isInheritedProp(object, propName)) {
      // eslint-disable-next-line fp/no-mutating-methods
      propNames.push(propName)
    }
  }

  return propNames
}

// Handle hooks exceptions when `value` is a Proxy.
const getOwnKeys = function (object) {
  try {
    return Reflect.ownKeys(object)
  } catch {
    return []
  }
}

// Handle hooks exceptions when `value` is a Proxy.
const isInheritedProp = function (object, propName) {
  try {
    return propName in object && !hasOwn.call(object, propName)
  } catch {
    return false
  }
}
