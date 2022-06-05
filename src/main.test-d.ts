import normalizeException from 'normalize-exception'
import { expectType, expectError } from 'tsd'

const error = new Error('test')
expectType<Error>(normalizeException(error))
normalizeException(undefined)
normalizeException('test')

expectError(normalizeException())
expectError(normalizeException(new Error('test'), {}))
