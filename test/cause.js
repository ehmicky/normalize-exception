import test from 'ava'
import normalizeException from 'normalize-exception'

const { propertyIsEnumerable: isEnum } = Object.prototype

test('Normalize error.cause', (t) => {
  const cause = 'inner'
  const error = new Error('test', { cause })
  const errorA = normalizeException(error)
  t.true(errorA.cause instanceof Error)
  t.false(isEnum.call(errorA, 'cause'))
  t.is(errorA.cause.message, cause)
})

test('Delete normalize error.cause undefined', (t) => {
  const error = new Error('test', { cause: undefined })
  const errorA = normalizeException(error)
  t.false('cause' in errorA)
})

test('Handle infinite error.cause', (t) => {
  const error = new Error('test')
  error.cause = error
  const errorA = normalizeException(error)
  t.false('cause' in errorA)
})
