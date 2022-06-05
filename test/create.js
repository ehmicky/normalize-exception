import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

each(
  // eslint-disable-next-line unicorn/no-null, no-magic-numbers
  [undefined, null, true, 0, 0n, '', 'test', Symbol('test')],
  ({ title }, exception) => {
    test(`Handle non-objects errors | ${title}`, (t) => {
      const error = normalizeException(exception)
      t.true(error instanceof Error)
      t.is(error.message, String(exception))
      t.is(typeof error.stack, 'string')
    })
  },
)
