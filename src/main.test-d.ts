import { expectAssignable, expectType, expectNotType, expectError } from 'tsd'

import normalizeException from './main.js'

expectAssignable<Error>(new Error('test'))
normalizeException(undefined)
normalizeException('test')

expectError(normalizeException())
expectError(normalizeException(new Error('test'), {}))

const { name, message } = normalizeException(
  new TypeError('test') as TypeError & { name: 'TypeError'; message: 'test' },
)
expectType<'TypeError'>(name)
expectType<'test'>(message)

const { name: nameA, message: messageA } = normalizeException(
  new TypeError('test') as TypeError & { name: ''; message: '' },
)
expectType<string>(nameA)
expectType<''>(messageA)
