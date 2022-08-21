import { setStack } from '../stack.js'

// `String()` might throw due to `value.toString()`, so we handle it.
export const stringifyError = function (value) {
  try {
    const error = new Error(String(value))
    setStack(error)
    return error
  } catch (error_) {
    return error_
  }
}
