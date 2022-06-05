import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

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

test('Plain-objects errors can have names', (t) => {
  const name = 'test'
  const error = normalizeException({ name })
  t.is(error.name, name)
  t.false(isEnum.call(error, 'name'))
  t.true(error instanceof Error)
})

test('Plain-objects errors can have messages', (t) => {
  const message = 'test'
  const error = normalizeException({ message })
  t.is(error.message, message)
  t.false(isEnum.call(error, 'message'))
})

each(['', true], ({ title }, message) => {
  test(`Plain-objects errors cannot have invalid messages | ${title}`, (t) => {
    const error = normalizeException({ message })
    t.is(error.message, '{}')
  })
})

test('Plain-objects errors without messages are serialized', (t) => {
  const exception = { prop: true }
  const error = normalizeException(exception)
  t.is(error.message, JSON.stringify(exception))
})

test('Plain-objects errors without messages are serialized even with recursion', (t) => {
  const exception = { prop: true }
  // eslint-disable-next-line fp/no-mutation
  exception.self = exception
  const error = normalizeException(exception)
  t.is(error.message, 'prop, self')
})

test('Plain-objects errors can have stacks', (t) => {
  const message = 'test'
  const stack = `Error: ${message}\n  at here`
  const error = normalizeException({ message, stack })
  t.is(error.stack, stack)
  t.false(isEnum.call(error, 'stack'))
})

test('Plain-objects errors without stacks get one', (t) => {
  const error = normalizeException({})
  t.true(error.stack.includes('at '))
})

test('Plain-objects errors can have causes', (t) => {
  const cause = new Error('test')
  const error = normalizeException({ cause })
  t.is(error.cause, cause)
  t.false(isEnum.call(error, 'cause'))
})

test('Plain-objects errors can have aggregate errors', (t) => {
  const errors = [new Error('test')]
  const error = normalizeException({ errors })
  t.deepEqual(error.errors, errors)
  t.false(isEnum.call(error, 'errors'))
})
