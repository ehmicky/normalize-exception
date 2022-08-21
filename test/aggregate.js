import { runInNewContext } from 'vm'

import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

if ('AggregateError' in globalThis) {
  test('Normalize error.errors in AggregateError', (t) => {
    const innerError = 'inner'
    const error = new AggregateError([innerError], 'test')
    const errorA = normalizeException(error)
    t.false(isEnum.call(errorA, 'errors'))
    t.true(errorA.errors[0] instanceof Error)
    t.is(errorA.errors[0].message, innerError)
  })

  test('Handle infinite error.errors', (t) => {
    const error = new AggregateError(['test'], 'test')
    error.errors[1] = error
    const errorA = normalizeException(error)
    t.is(errorA.errors.length, 1)
  })

  test('Plain-objects errors remain the same', (t) => {
    const innerError = new Error('inner')
    const error = new AggregateError([innerError], 'test', {
      cause: new Error('cause'),
    })
    error.prop = true
    const { name, message, stack, cause, errors, ...props } = error
    const errorObj = { ...props, name, message, stack, cause, errors }
    const errorA = normalizeException(errorObj)
    t.deepEqual(errorA, error)
    t.true(stack.includes(errorA.stack))
    t.is(errorA.cause, cause)
    t.deepEqual(errorA.errors, errors)
  })
}

test('Normalize error.errors in non-AggregateError', (t) => {
  const error = new Error('test')
  const innerError = 'inner'
  error.errors = [innerError]
  const errorA = normalizeException(error)
  t.is(errorA.errors[0].message, innerError)
})

each([true, false], ({ title }, shallow) => {
  test(`Fix invalid error.errors to non-AggregateError | ${title}`, (t) => {
    const error = new Error('test')
    const innerError = 'inner'
    error.errors = innerError
    const errorA = normalizeException(error, { shallow })
    t.false('errors' in errorA)
  })

  if ('AggregateError' in globalThis) {
    test(`Add missing error.errors to AggregateError | ${title}`, (t) => {
      const error = new AggregateError([], 'test')
      // eslint-disable-next-line fp/no-delete
      delete error.errors
      t.false('errors' in error)
      const errorA = normalizeException(error, { shallow })
      t.deepEqual(errorA.errors, [])
    })

    test(`Add missing error.errors to AggregateError in different realms | ${title}`, (t) => {
      const CustomAggregateError = runInNewContext('AggregateError')
      const error = new CustomAggregateError([], 'test')
      // eslint-disable-next-line fp/no-delete
      delete error.errors
      t.deepEqual(normalizeException(error, { shallow }).errors, [])
    })

    test(`Fix invalid error.errors to AggregateError | ${title}`, (t) => {
      const error = new AggregateError([], 'test')
      error.errors = new Error('test')
      const errorA = normalizeException(error, { shallow })
      t.deepEqual(errorA.errors, [])
    })

    test(`Ignore undefined error.errors to AggregateError | ${title}`, (t) => {
      const innerError = new Error('inner')
      const error = new AggregateError([undefined, innerError], 'test')
      const errorA = normalizeException(error, { shallow })
      t.deepEqual(errorA.errors, [innerError])
    })
  } else {
    test(`Plain-objects AggregateError do not work in older environments | ${title}`, (t) => {
      const errorA = normalizeException(
        {
          name: 'AggregateError',
          message: 'test',
        },
        { shallow },
      )
      t.is(errorA.name, 'Error')
      t.is(errorA.constructor, Error)
    })
  }
})

test('Does not normalize error.errors if shallow', (t) => {
  const error = new Error('test')
  const innerError = 'inner'
  error.errors = [innerError]
  const errorA = normalizeException(error, { shallow: true })
  t.is(errorA.errors[0], innerError)
})
