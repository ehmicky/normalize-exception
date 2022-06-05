import test from 'ava'
import normalizeException from 'normalize-exception'

test('Normal errors are left as is', (t) => {
  const error = new TypeError('test')
  const errorString = error.toString()
  const errorA = normalizeException(error)
  t.true(errorA instanceof TypeError)
  t.is(errorA.toString(), errorString)
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
