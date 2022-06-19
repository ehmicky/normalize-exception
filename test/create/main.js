import { runInNewContext } from 'vm'

import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

test('Plain-objects errors work cross-realm', (t) => {
  const props = runInNewContext('({ name: "test" })')
  const error = normalizeException(props)
  t.is(error.name, 'test')
  t.true(error instanceof Error)
})

test('Plain-objects with toString tag', (t) => {
  const error = normalizeException({
    [Symbol.toStringTag]: 'Error',
    message: 'test',
  })
  t.is(error.message, '[object Error]')
  t.true(error instanceof Error)
})

const constructorWithoutName = function () {}
// eslint-disable-next-line fp/no-mutating-methods
Object.defineProperty(constructorWithoutName, 'name', { value: false })
const constructorWithEmptyName = function () {}
// eslint-disable-next-line fp/no-mutating-methods
Object.defineProperty(constructorWithEmptyName, 'name', { value: '' })
each(
  ['', constructorWithoutName, constructorWithEmptyName],
  ({ title }, errorConstructor) => {
    test(`Plain-objects with errors with wrong constructor | ${title}`, (t) => {
      const message = 'test'
      const error = new Error(message)
      error.constructor = errorConstructor
      const errorA = normalizeException(error)
      t.is(errorA.message, message)
      t.is(errorA.constructor, Error)
    })
  },
)
