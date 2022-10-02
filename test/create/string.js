import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

each(
  [
    undefined,
    null,
    true,
    0,
    0n,
    '',
    'test',
    Symbol('test'),
    Object.create({}),
    new Set([]),
  ],
  ({ title }, exception) => {
    test(`Handle non-plain-objects errors | ${title}`, (t) => {
      const error = normalizeException(exception)
      t.true(error instanceof Error)
      const message = String(exception)
      t.is(error.message, message)
      t.true(error.stack.includes('Error'))
      t.true(error.stack.includes(message))
    })
  },
)

test('Handle exceptions with invalid toString()', (t) => {
  const exception = Object.create({
    toString() {
      throw new Error('test')
    },
  })
  const error = normalizeException(exception)
  t.true(error instanceof Error)
  t.is(error.message, 'test')
  t.true(error.stack.includes('toString'))
})

test('Handle unextensible errors', (t) => {
  const error = new TypeError('test')
  // eslint-disable-next-line fp/no-delete
  delete error.message
  Object.preventExtensions(error)
  const errorA = normalizeException(error)
  t.true(errorA instanceof TypeError)
  t.is(error.message, '')
})
