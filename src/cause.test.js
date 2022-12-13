import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

const hasErrorCause = () => {
  const { cause } = new Error('test', { cause: true })
  return cause === true
}

if (hasErrorCause()) {
  test('Normalize error.cause', (t) => {
    const cause = 'inner'
    const error = new Error('test', { cause })
    const errorA = normalizeException(error)
    t.true(errorA.cause instanceof Error)
    t.false(isEnum.call(errorA, 'cause'))
    t.is(errorA.cause.message, cause)
  })

  test('Does not normalize error.cause if shallow', (t) => {
    const cause = 'inner'
    const error = new Error('test', { cause })
    const errorA = normalizeException(error, { shallow: true })
    t.is(errorA.cause, cause)
  })

  each([true, false], ({ title }, shallow) => {
    test(`Delete normalize error.cause undefined | ${title}`, (t) => {
      const error = new Error('test', { cause: undefined })
      const errorA = normalizeException(error, { shallow })
      t.false('cause' in errorA)
    })
  })
}

test('Handle infinite error.cause', (t) => {
  const error = new Error('test')
  error.cause = error
  const errorA = normalizeException(error)
  t.false('cause' in errorA)
})
