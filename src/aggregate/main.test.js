import { runInNewContext } from 'node:vm'

import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

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

    test(`Add missing error.errors to AggregateError even if inherited | ${title}`, (t) => {
      // eslint-disable-next-line fp/no-class
      class ChildError extends Error {}
      // eslint-disable-next-line fp/no-mutation
      ChildError.prototype.errors = ''
      const error = new ChildError('test')
      t.is(error.errors, '')
      const errorA = normalizeException(error, { shallow })
      t.deepEqual(errorA.errors, [])
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
        { name: 'AggregateError', message: 'test' },
        { shallow },
      )
      t.is(errorA.name, 'AggregateError')
      t.is(errorA.constructor, Error)
    })
  }
})
