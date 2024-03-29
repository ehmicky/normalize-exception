import { runInNewContext } from 'node:vm'

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

test('Cross-realm errors are left as is', (t) => {
  const CrossTypeError = runInNewContext('TypeError')
  const error = new CrossTypeError('test')
  const errorA = normalizeException(error)
  t.is(errorA, error)
  t.true(errorA instanceof CrossTypeError)
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
    t.true(normalizeException(error).stack.includes('test'))
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

test('Does not fix error.name not matching constructor names', (t) => {
  const error = new TypeError('test')
  error.name = 'Error'
  t.is(normalizeException(error).name, 'Error')
})

// eslint-disable-next-line fp/no-class
class TestError extends Error {}
// eslint-disable-next-line fp/no-mutation
TestError.prototype.name = 'OtherError'

test('Prefer prototype.name over constructor.name', (t) => {
  const error = new TestError('test')
  error.name = ''
  t.is(normalizeException(error).name, 'OtherError')
})

// eslint-disable-next-line fp/no-class
class InvalidError extends Error {}
// eslint-disable-next-line fp/no-mutation
InvalidError.prototype.name = ''

test('Fallback to constructor.name', (t) => {
  const error = new InvalidError('test')
  error.name = ''
  t.is(normalizeException(error).name, 'InvalidError')
})
