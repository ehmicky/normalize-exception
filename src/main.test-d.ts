import { expectType, expectError } from 'tsd'

import normalizeException from './main.js'

expectType<Error>(normalizeException(new Error('test')))
normalizeException(undefined)
normalizeException('test')

expectError(normalizeException())
expectError(normalizeException(new Error('test'), {}))
