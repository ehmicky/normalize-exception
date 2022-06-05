import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

each(
  // eslint-disable-next-line unicorn/no-null, no-magic-numbers
  [undefined, null, true, 0, 0n, '', 'test', Symbol('test')],
  ({ title }, exception) => {
    test(`Handle non-objects errors | ${title}`, (t) => {
      const error = normalizeException(exception)
      t.true(error instanceof Error)
      const message = String(exception)
      t.is(error.message, message)
      t.is(typeof error.stack, 'string')
      t.false(isEnum.call(error, 'stack'))
      t.true(error.stack.includes(`Error: ${message}`))
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
