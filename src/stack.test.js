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

test('New stack includes internal code', (t) => {
  const { stack } = normalizeException()
  t.true(stack.includes('normalize-exception'))
})

test.serial('New stack with prepareStackTrace()', (t) => {
  const message = '\ntest'
  // eslint-disable-next-line fp/no-mutation
  Error.prepareStackTrace = () => message
  t.is(normalizeException('test').stack, message)
  // eslint-disable-next-line fp/no-delete
  delete Error.prepareStackTrace
})

test.serial('New stack with prepareStackTrace() empty', (t) => {
  // eslint-disable-next-line fp/no-mutation
  Error.prepareStackTrace = () => ''
  t.is(normalizeException('test').stack, 'Error: test')
  // eslint-disable-next-line fp/no-delete
  delete Error.prepareStackTrace
})

test.serial('New stack with prepareStackTrace() not a string', (t) => {
  // eslint-disable-next-line fp/no-mutation
  Error.prepareStackTrace = () => true
  t.is(normalizeException('test').stack, 'Error: test')
  // eslint-disable-next-line fp/no-delete
  delete Error.prepareStackTrace
})

test.serial('New stack with stackTraceLimit 0', (t) => {
  const { stackTraceLimit } = Error
  // eslint-disable-next-line fp/no-mutation
  Error.stackTraceLimit = 0
  t.is(normalizeException('test').stack, 'Error: test')
  // eslint-disable-next-line fp/no-mutation
  Error.stackTraceLimit = stackTraceLimit
})

test.serial('New stack with stackTraceLimit undefined', (t) => {
  const { stackTraceLimit } = Error
  // eslint-disable-next-line fp/no-delete
  delete Error.stackTraceLimit
  t.is(normalizeException('test').stack, 'Error: test')
  // eslint-disable-next-line fp/no-mutation
  Error.stackTraceLimit = stackTraceLimit
})

test('Keeps prefixed header in error.stack', (t) => {
  const error = new TypeError('test')
  const stack = `Test\n${error.stack}`
  error.stack = stack
  t.is(normalizeException(error).stack, stack)
})
