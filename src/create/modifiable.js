import { CORE_ERROR_PROPS } from '../descriptors.js'

// If error cannot be modified, make it modifiable by cloning it
export const isNonModifiableError = (error) =>
  !Object.isExtensible(error) ||
  CORE_ERROR_PROPS.some(
    (propName) =>
      isNonConfigurableProp(error, propName) || isThrowingProp(error, propName),
  )

// Inherited properties are always configurable: using `Object.defineProperty()`
// creates an own property instead.
const isNonConfigurableProp = (error, propName) => {
  const descriptor = Object.getOwnPropertyDescriptor(error, propName)
  return descriptor !== undefined && !descriptor.configurable
}

// Handle when the property is a getter that throws
const isThrowingProp = (error, propName) => {
  try {
    // eslint-disable-next-line no-unused-expressions
    error[propName]
    return false
  } catch {
    return true
  }
}
