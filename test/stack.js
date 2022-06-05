import test from 'ava'
import normalizeException from 'normalize-exception'

const { propertyIsEnumerable: isEnum } = Object.prototype

test('Create a new stack on non-errors', (t) => {
  const error = normalizeException()
  t.is(typeof error.stack, 'string')
  t.false(isEnum.call(error, 'stack'))
  t.true(error.stack.includes('Error: undefined'))
})
