import normalizeException from 'normalize-exception'
import { expectType, expectError } from 'tsd'

expectType<Error>(normalizeException(new Error('test')))
normalizeException(undefined)
normalizeException('test')

expectError(normalizeException())
expectError(normalizeException(new Error('test'), {}))
