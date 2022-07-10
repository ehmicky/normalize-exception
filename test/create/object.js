import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

test('Plain-objects errors can have names', (t) => {
  const name = 'test'
  const error = normalizeException({ name })
  t.is(error.name, name)
  t.false(isEnum.call(error, 'name'))
  t.true(error instanceof Error)
})

test('Plain-objects errors can re-use native error types', (t) => {
  const name = 'TypeError'
  const error = normalizeException({ name })
  t.is(error.name, name)
  t.true(error instanceof TypeError)
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

test('Plain-objects errors can have static properties', (t) => {
  const error = normalizeException({ message: 'test', prop: true })
  t.true(error.prop)
})
