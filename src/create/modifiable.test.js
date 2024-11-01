import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

each(
  [
    { propName: 'name', value: 'TestError' },
    { propName: 'message', value: 'test' },
    { propName: 'stack', value: new Error('test').stack },
    { propName: 'cause', value: new Error('test') },
    { propName: 'errors', value: [] },
  ],
  [
    { writable: true, enumerable: false, configurable: true },
    { writable: false, enumerable: false, configurable: true },
    { writable: true, enumerable: true, configurable: true },
    { writable: true, enumerable: false, configurable: false },
    { writable: false, enumerable: true, configurable: false },
  ],
  ({ title }, { propName, value }, descriptor) => {
    test(`Fix invalid descriptors | ${title}`, (t) => {
      const error = new Error('test')
      // eslint-disable-next-line fp/no-mutating-methods
      Object.defineProperty(error, propName, { ...descriptor, value })
      const errorA = normalizeException(error)
      const descriptorA = Object.getOwnPropertyDescriptor(errorA, propName)
      t.deepEqual(descriptorA, {
        value: descriptorA.value,
        writable: true,
        enumerable: false,
        configurable: true,
      })
    })
  },
)
