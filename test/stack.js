import test from 'ava'
import normalizeException from 'normalize-exception'

const { propertyIsEnumerable: isEnum } = Object.prototype

test('Create a new stack on non-errors', (t) => {
  t.is(typeof normalizeException().stack, 'string')
})

test('New stack is not enumerable', (t) => {
  t.false(isEnum.call(normalizeException(), 'stack'))
})

test('New stack includes name and message', (t) => {
  t.true(normalizeException().stack.includes('Error: undefined'))
})

test('New stack does not included internal code', (t) => {
  t.true(normalizeException().stack.includes('stack.js'))
  t.false(normalizeException().stack.includes('normalizeException'))
})

test.serial('New stack internal code removal with prepareStackTrace()', (t) => {
  // eslint-disable-next-line fp/no-mutation
  Error.prepareStackTrace = () => '\ntest'
  t.true(normalizeException().stack.includes('test'))
  // eslint-disable-next-line fp/no-delete
  delete Error.prepareStackTrace
})

test.serial('New stack internal code removal with stackTraceLimit low', (t) => {
  // eslint-disable-next-line fp/no-mutation
  Error.stackTraceLimit = 6
  t.true(normalizeException().stack.includes('at '))
  // eslint-disable-next-line fp/no-delete
  delete Error.stackTraceLimit
})

test.serial('New stack internal code removal with stackTraceLimit 0', (t) => {
  // eslint-disable-next-line fp/no-mutation
  Error.stackTraceLimit = 0
  t.false(normalizeException().stack.trim().endsWith('Error:'))
  // eslint-disable-next-line fp/no-delete
  delete Error.stackTraceLimit
})
