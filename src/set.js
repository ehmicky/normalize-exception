// Error properties are non-enumerable
export const setErrorProperty = function (error, propName, value) {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, propName, {
    value,
    writable: true,
    enumerable: false,
  })
}
