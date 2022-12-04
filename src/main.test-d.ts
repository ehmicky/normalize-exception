import { expectAssignable, expectType } from 'tsd'

import normalizeException from 'normalize-exception'

const error = new Error('test')
expectAssignable<Error>(error)
normalizeException(undefined)
normalizeException('test')
normalizeException('test', {})
normalizeException('test', { shallow: true })

// @ts-expect-error
normalizeException()
// @ts-expect-error
normalizeException(error, { unknown: true })
// @ts-expect-error
normalizeException(error, { shallow: 'true' })

expectType<'TypeError'>(
  normalizeException(error as Error & { name: 'TypeError' }).name,
)
expectType<string>(normalizeException(error as Error & { name: '' }).name)
expectType<'test'>(
  normalizeException(error as Error & { message: 'test' }).message,
)
expectType<''>(normalizeException(error as Error & { message: '' }).message)
expectType<'stack'>(
  normalizeException(error as Error & { stack: 'stack' }).stack,
)
expectType<string>(normalizeException(error as Error & { stack: '' }).stack)
