import test from 'ava'
import normalizeException from 'normalize-exception'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

test('Plain-objects errors can have messages', (t) => {
  const message = 'test'
  const error = normalizeException({ message })
  t.is(error.message, message)
  t.false(isEnum.call(error, 'message'))
})

each(['', true], ({ title }, message) => {
  test(`Plain-objects errors cannot have invalid messages | ${title}`, (t) => {
    t.is(normalizeException({ message }).message, '{}')
  })
})

test('Plain-objects errors without messages are serialized', (t) => {
  const exception = { prop: true }
  t.is(normalizeException(exception).message, JSON.stringify(exception))
})

test('Plain-objects errors without messages are serialized even with recursion', (t) => {
  const exception = { prop: true }
  // eslint-disable-next-line fp/no-mutation
  exception.self = exception
  const error = normalizeException(exception)
  t.is(error.message, String({}))
})

const throwError = function () {
  throw new Error('test')
}

test('Plain-objects errors without messages are serialized even with unsafe fields', (t) => {
  const exception = {
    one: true,
    two: { toJSON: throwError },
    // eslint-disable-next-line fp/no-get-set
    get three() {
      throw new Error('test')
    },
  }
  t.is(normalizeException(exception).message, String({}))
})

test('Plain-objects errors without messages are serialized even with top-level unsafe fields', (t) => {
  const exception = { toJSON: throwError }
  t.is(normalizeException(exception).message, String({}))
})

test('Plain-objects errors without messages are serialized even with invalid toString()', (t) => {
  const exception = { one: true, two: 0n, toString: throwError }
  t.is(normalizeException(exception).message, 'Invalid error')
})

test('Plain-objects errors without messages but with bigints are serialized', (t) => {
  const exception = { one: true, two: 0n }
  t.is(normalizeException(exception).message, String({}))
})

test('Plain-objects errors without messages but with long fields are serialized', (t) => {
  const exception = { one: true, two: 'a'.repeat(BIG_STRING_LENGTH) }
  const { message } = normalizeException(exception)
  t.true(message.includes('one'))
  t.true(message.length < BIG_STRING_LENGTH)
})

const BIG_STRING_LENGTH = 1e6
