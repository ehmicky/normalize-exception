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
  const { name, message, stack } = normalizeException()
  t.true(stack.includes(name))
  t.true(stack.includes(message))
})

test('New stack does not include internal code', (t) => {
  const { stack } = normalizeException()
  t.true(stack.includes('stack.js'))
  t.false(stack.includes('normalizeException'))
})

test.serial('New stack internal code removal with prepareStackTrace()', (t) => {
  // eslint-disable-next-line fp/no-mutation
  Error.prepareStackTrace = () => '\ntest'
  t.true(normalizeException().stack.includes('test'))
  // eslint-disable-next-line fp/no-delete
  delete Error.prepareStackTrace
})

test.serial(
  'New stack internal code removal with prepareStackTrace() empty',
  (t) => {
    // eslint-disable-next-line fp/no-mutation
    Error.prepareStackTrace = () => ''
    t.is(normalizeException().stack, 'Error: undefined')
    // eslint-disable-next-line fp/no-delete
    delete Error.prepareStackTrace
  },
)

test.serial('New stack internal code removal with stackTraceLimit low', (t) => {
  const { stackTraceLimit } = Error
  // eslint-disable-next-line fp/no-mutation
  Error.stackTraceLimit = 7
  t.true(normalizeException().stack.includes('at '))
  // eslint-disable-next-line fp/no-mutation
  Error.stackTraceLimit = stackTraceLimit
})

test.serial('New stack internal code removal with stackTraceLimit 0', (t) => {
  const { stackTraceLimit } = Error
  // eslint-disable-next-line fp/no-mutation
  Error.stackTraceLimit = 0
  t.false(normalizeException().stack.trim().endsWith('Error:'))
  // eslint-disable-next-line fp/no-mutation
  Error.stackTraceLimit = stackTraceLimit
})

test.serial(
  'New stack internal code removal with stackTraceLimit undefined',
  (t) => {
    const { stackTraceLimit } = Error
    // eslint-disable-next-line fp/no-delete
    delete Error.stackTraceLimit
    t.is(normalizeException().stack, 'Error: undefined')
    // eslint-disable-next-line fp/no-mutation
    Error.stackTraceLimit = stackTraceLimit
  },
)

test('Keeps prefixed header in error.stack', (t) => {
  const error = new TypeError('test')
  const stack = `Test\n${error.stack}`
  error.stack = stack
  t.is(normalizeException(error).stack, stack)
})
