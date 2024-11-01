import test from 'ava'
import normalizeException from 'normalize-exception'

const setInvalidProp = (propName) =>
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(new Error('test'), propName, { get: invalidGet })

const invalidGet = () => {
  throw new Error('getterError')
}

test('Handle throwing getters on name', (t) => {
  t.is(normalizeException(setInvalidProp('name')).name, 'Error')
})

test('Handle throwing getters on message', (t) => {
  t.is(normalizeException(setInvalidProp('message')).message, '{}')
})

test('Handle throwing getters on stack', (t) => {
  const error = normalizeException(setInvalidProp('stack'))
  t.true(error.stack.includes(error.toString()))
})

test('Handle throwing getters on cause', (t) => {
  t.is(normalizeException(setInvalidProp('cause')).cause, undefined)
})

test('Handle throwing getters on aggregate errors', (t) => {
  t.is(normalizeException(setInvalidProp('errors')).errors, undefined)
})

test('Handle throwing getters on plain objects', (t) => {
  t.is(
    normalizeException({
      // eslint-disable-next-line fp/no-get-set
      get name() {
        throw new Error('getterError')
      },
    }).name,
    'Error',
  )
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
Object.defineProperty(ChildError.prototype, 'message', { value: 'test' })
// eslint-disable-next-line fp/no-mutating-methods
Object.defineProperty(ChildError.prototype, 'prop', { value: true })

test('Plain-objects errors ignore inherited static properties', (t) => {
  const error = new ChildError()
  Object.preventExtensions(error)
  t.is(error.prop, true)
  t.is(normalizeException(error).prop, undefined)
})

test('Plain-objects errors do not ignore inherited core properties', (t) => {
  const error = new ChildError()
  Object.preventExtensions(error)
  t.is(error.message, 'test')
  t.is(normalizeException(error).message, 'test')
})
