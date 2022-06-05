import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

each(
  [
    undefined,
    // eslint-disable-next-line unicorn/no-null
    null,
    true,
    0,
    // eslint-disable-next-line no-magic-numbers
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
