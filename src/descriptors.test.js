import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum, hasOwnProperty: hasOwn } =
  Object.prototype

test('Handles non-enumerable inherited error properties', (t) => {
  // eslint-disable-next-line fp/no-class
  class TestError extends Error {}
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(TestError.prototype, 'name', {
    value: TestError.name,
    writable: true,
    enumerable: true,
    configurable: true,
  })
  t.true(isEnum.call(TestError.prototype, 'name'))
  const error = new TestError('test')
  t.false(hasOwn.call(error, 'name'))
  t.true(isEnum.call(Object.getPrototypeOf(error), 'name'))
  const normalizedError = normalizeException(error)
  t.true(hasOwn.call(normalizedError, 'name'))
  t.false(isEnum.call(normalizedError, 'name'))
})

test('Handles non-enumerable getters', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'message', {
    get: getMessage,
    set: setMessage,
    enumerable: true,
    configurable: true,
  })
  t.is(error.message, 'testTwo')
  t.true(isEnum.call(error, 'message'))
  const normalizedError = normalizeException(error)
  t.is(normalizedError.message, 'testTwo')
  t.false(isEnum.call(normalizedError, 'message'))
  t.is(
    Object.getOwnPropertyDescriptor(normalizedError, 'message').get,
    getMessage,
  )
})

test('Handles readonly getters', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'message', {
    get: getMessage,
    enumerable: true,
    configurable: true,
  })
  t.is(error.message, 'testTwo')
  const normalizedError = normalizeException(error)
  t.is(
    Object.getOwnPropertyDescriptor(normalizedError, 'message').value,
    'testTwo',
  )
})

const getMessage = () => 'testTwo'

const setMessage = () => {}

each(
  [
    { propName: 'lineNumber', enumerable: false },
    { propName: 'columnNumber', enumerable: false },
    { propName: 'fileName', enumerable: false },
    { propName: 'line', enumerable: true },
    { propName: 'column', enumerable: true },
  ],
  ({ title }, { propName, enumerable }) => {
    test(`Non-standard error properties are left as is | ${title}`, (t) => {
      const error = new Error('test')
      const value = 0
      // eslint-disable-next-line fp/no-mutating-methods
      Object.defineProperty(error, propName, {
        value,
        enumerable,
        writable: true,
        configurable: true,
      })
      const normalizedError = normalizeException(error)
      t.is(normalizedError[propName], value)
      t.is(
        Object.getOwnPropertyDescriptor(normalizedError, propName).enumerable,
        enumerable,
      )
    })
  },
)
