import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum, hasOwnProperty: hasOwn } =
  Object.prototype

each(
  [
    { propName: 'name', value: 'TestError' },
    { propName: 'message', value: 'test' },
    { propName: 'stack', value: new Error('test').stack },
    { propName: 'cause', value: new Error('test') },
    { propName: 'errors', value: [] },
  ],
  ({ title }, { propName, value }) => {
    test(`Fix non-enumerable properties | ${title}`, (t) => {
      const error = new Error('test')
      // eslint-disable-next-line fp/no-mutating-methods
      Object.defineProperty(error, propName, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      })
      t.true(isEnum.call(error, propName))
      t.false(isEnum.call(normalizeException(error), propName))
    })
  },
)

test('Handles non-enumerable inherited error properties', (t) => {
  // eslint-disable-next-line unicorn/custom-error-definition, fp/no-class
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
  t.true(hasOwn.call(normalizeException(error), 'name'))
  t.false(isEnum.call(normalizeException(error), 'name'))
})

test('Handles non-enumerable non-configurable error properties', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'message', {
    value: error.message,
    writable: true,
    enumerable: true,
    configurable: false,
  })
  t.true(isEnum.call(error, 'message'))
  t.true(isEnum.call(normalizeException(error), 'message'))
})

test('Handles non-enumerable non-writable error properties', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'message', {
    value: error.message,
    writable: false,
    enumerable: true,
    configurable: true,
  })
  t.true(isEnum.call(error, 'message'))
  t.false(isEnum.call(normalizeException(error), 'message'))
})
