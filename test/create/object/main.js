import test from 'ava'
import normalizeException from 'normalize-exception'

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

test('Plain-objects errors can have stacks', (t) => {
  const message = 'test'
  const stack = `Error: ${message}\n  at here`
  const error = normalizeException({ message, stack })
  t.is(error.stack, stack)
  t.false(isEnum.call(error, 'stack'))
})

test('Plain-objects errors without stacks get one', (t) => {
  t.true(normalizeException({}).stack.includes('at '))
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
  t.true(normalizeException({ message: 'test', prop: true }).prop)
})
