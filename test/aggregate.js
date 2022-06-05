import test from 'ava'
import normalizeException from 'normalize-exception'

const { propertyIsEnumerable: isEnum } = Object.prototype

const hasAggregateError = function () {
  try {
    // eslint-disable-next-line no-unused-expressions
    AggregateError
    return true
  } catch {
    return false
  }
}

if (hasAggregateError()) {
  test('Normalize error.errors', (t) => {
    const innerError = 'inner'
    const error = new AggregateError([innerError], 'test')
    const errorA = normalizeException(error)
    t.false(isEnum.call(errorA, 'errors'))
    t.true(errorA.errors[0] instanceof Error)
    t.is(errorA.errors[0].message, innerError)
  })

  test('Add missing error.errors to AggregateError', (t) => {
    const error = new AggregateError([], 'test')
    // eslint-disable-next-line fp/no-delete
    delete error.errors
    t.false('errors' in error)
    const errorA = normalizeException(error)
    t.deepEqual(errorA.errors, [])
  })

  test('Fix invalid error.errors to AggregateError', (t) => {
    const error = new AggregateError([], 'test')
    error.errors = new Error('test')
    const errorA = normalizeException(error)
    t.deepEqual(errorA.errors, [])
  })

  test('Handle infinite error.errors', (t) => {
    const error = new AggregateError(['test'], 'test')
    error.errors[1] = error
    const errorA = normalizeException(error)
    t.is(errorA.errors.length, 1)
  })
}
