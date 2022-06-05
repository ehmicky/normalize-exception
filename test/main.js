import test from 'ava'
import normalizeException from 'normalize-exception'

test('Dummy test', (t) => {
  t.is(typeof normalizeException, 'function')
})
