import test from 'ava'
import normalizeException from 'normalize-exception'

const invalidGet = function () {
  throw new Error('getterError')
}

test('Handle throwing getters on name', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'name', { get: invalidGet })
  t.is(normalizeException(error).name, 'Error')
})

test('Handle throwing getters on message', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'message', { get: invalidGet })
  t.is(normalizeException(error).message, '{}')
})

test('Handle throwing getters on stack', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'stack', { get: invalidGet })
  const errorA = normalizeException(error)
  t.true(errorA.stack.includes(errorA.toString()))
})

test('Handle throwing getters on cause', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'cause', { get: invalidGet })
  t.is(normalizeException(error).cause, undefined)
})

test('Handle throwing getters on aggregate errors', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'errors', { get: invalidGet })
  t.is(normalizeException(error).errors, undefined)
})

test('Handle throwing getters on name on plain objects', (t) => {
  const error = {}
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'name', { get: invalidGet, enumerable: true })
  t.is(normalizeException(error).name, 'Error')
})

test('Plain-objects errors ignore non-enumerable static properties', (t) => {
  t.is(
    normalizeException(
      // eslint-disable-next-line fp/no-mutating-methods
      Object.defineProperty({ message: 'test' }, 'prop', {
        value: true,
        enumerable: false,
      }),
    ).prop,
    undefined,
  )
})

test('Plain-objects errors do not ignore non-enumerable core properties', (t) => {
  const name = 'TypeError'
  t.is(
    normalizeException(
      // eslint-disable-next-line fp/no-mutating-methods
      Object.defineProperty({ message: 'test' }, 'name', {
        value: name,
        enumerable: false,
      }),
    ).name,
    name,
  )
})

// eslint-disable-next-line fp/no-class
class ChildError extends Error {}
// eslint-disable-next-line fp/no-mutating-methods
Object.defineProperty(ChildError.prototype, 'name', { value: ChildError.name })
// eslint-disable-next-line fp/no-mutating-methods
Object.defineProperty(ChildError.prototype, 'prop', { value: true })

test('Plain-objects errors ignore inherited static properties', (t) => {
  const error = new ChildError()
  error.constructor = undefined
  t.is(error.prop, true)
  t.is(normalizeException(error).prop, undefined)
})

test('Plain-objects errors do not ignore inherited core properties', (t) => {
  const error = new ChildError()
  error.constructor = undefined
  t.is(error.name, 'ChildError')
  t.is(normalizeException(error).name, 'ChildError')
})
