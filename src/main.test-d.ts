import normalizeException from 'normalize-exception'
import { expectType, expectError } from 'tsd'

const error = new Error('test')
expectType<Error>(normalizeException(error))

expectError(normalizeException())
