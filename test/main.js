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

each([undefined, true, ''], ({ title }, name) => {
  test(`Fix invalid error.name | ${title}`, (t) => {
    const error = new TypeError('test')
    error.name = name
    t.is(normalizeException(error).name, 'TypeError')
    t.false(isEnum.call(error, 'name'))
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
