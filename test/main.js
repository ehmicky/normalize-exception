import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

test('Normal errors are left as is', (t) => {
  const error = new TypeError('test')
  const errorString = error.toString()
  const errorA = normalizeException(error)
  t.true(errorA instanceof TypeError)
  t.is(errorA.toString(), errorString)
})

each([undefined, true, ''], ({ title }, value) => {
  test(`Fix invalid error.name | ${title}`, (t) => {
    const error = new TypeError('test')
    error.name = value
    t.is(normalizeException(error).name, 'TypeError')
    t.false(isEnum.call(error, 'name'))
  })

  test(`Fix invalid error.message | ${title}`, (t) => {
    const error = new Error('test')
    error.message = value
    t.is(normalizeException(error).message, '')
    t.false(isEnum.call(error, 'message'))
  })

  test(`Fix invalid error.stack | ${title}`, (t) => {
    const error = new Error('test')
    error.stack = value
    t.true(normalizeException(error).stack.includes('at '))
    t.false(isEnum.call(error, 'stack'))
  })
})

test.serial('Fix invalid error.name without constructor names', (t) => {
  const error = new TypeError('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(TypeError, 'name', { value: '' })
  error.name = ''
  t.is(normalizeException(error).name, 'Error')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(TypeError, 'name', { value: 'TypeError' })
})

test('Fix invalid error.stack with wrong name', (t) => {
  const error = new TypeError('test')
  const { stack } = error
  const name = 'RangeError'
  error.name = name
  const lines = stack.split('\n')
  const lastStackLine = lines[lines.length - 1]
  const errorA = normalizeException(error)
  t.true(errorA.stack.includes(`${name}:`))
  t.true(errorA.stack.endsWith(lastStackLine))
})

test('Handle infinite error.cause', (t) => {
  const error = new Error('test')
  error.cause = error
  const errorA = normalizeException(error)
  t.false('cause' in errorA)
})

test('Handle infinite error.errors', (t) => {
  const error = new AggregateError(['test'], 'test')
  error.errors[1] = error
  const errorA = normalizeException(error)
  t.is(errorA.errors.length, 1)
})
