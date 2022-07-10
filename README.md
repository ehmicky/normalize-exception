[![Codecov](https://img.shields.io/codecov/c/github/ehmicky/normalize-exception.svg?label=tested&logo=codecov)](https://codecov.io/gh/ehmicky/normalize-exception)
[![Node](https://img.shields.io/node/v/normalize-exception.svg?logo=node.js)](https://www.npmjs.com/package/normalize-exception)
[![TypeScript](https://img.shields.io/badge/-typed-brightgreen?logo=typescript&colorA=gray)](/src/main.d.ts)
[![Twitter](https://img.shields.io/badge/%E2%80%8B-twitter-brightgreen.svg?logo=twitter)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/%E2%80%8B-medium-brightgreen.svg?logo=medium)](https://medium.com/@ehmicky)

Normalize exceptions/errors.

# Features

This fixes the following problems:

- Exceptions that are [not `Error` instances](#invalid-types)
- [Missing](#missing-properties) or
  [invalid error properties](#invalid-properties): `name`, `message`,
  [`stack`](#invalid-stack), `cause`, `errors`.
- Error properties that are [unsafe getters](#unsafe-getters)

# Examples

## Invalid types

### Strings

<!-- eslint-disable unicorn/no-null, no-throw-literal -->

```js
import normalizeException from 'normalize-exception'

try {
  throw 'message'
} catch (error) {
  console.log(error) // 'message'
  console.log(normalizeException(error)) // Error: message
  console.log(error instanceof Error) // true
}
```

### Plain objects

```js
console.log(normalizeException({ name: 'TypeError', message: 'message' })) // TypeError: message
```

### Others

<!-- eslint-disable unicorn/no-null, no-throw-literal -->

```js
console.log(normalizeException(null)) // Error: null
```

## Missing properties

<!-- eslint-disable fp/no-delete -->

```js
const error = new TypeError('message')
delete error.name
console.log(error.name) // undefined
console.log(normalizeException(error).name) // 'TypeError'
```

## Invalid properties

```js
const error = new Error('message', { cause: 'innerError' })
console.log(error.cause instanceof Error) // false

const normalizedError = normalizeException(error)
console.log(normalizedError.cause instanceof Error) // true
console.log(normalizedError.cause) // Error: innerError
```

## Missing stack

<!-- eslint-disable fp/no-delete -->

```js
const error = new Error('message')
delete error.stack
console.log(error.stack) // undefined
console.log(normalizeException(error).stack) // 'Error: message ...'
```

## Invalid stack

```js
const error = new TypeError('message')
console.log(error.stack) // TypeError: message

// `error.stack` is cached, so it does not update
error.message += ' otherMessage'
console.log(error.stack) // TypeError: message
console.log(normalizeException(error).stack) // TypeError: message otherMessage
```

## Unsafe getters

<!-- eslint-disable fp/no-mutating-methods, no-unused-expressions -->

```js
const error = new Error('message')
Object.defineProperty(error, 'message', {
  get() {
    throw new Error('example')
  },
})

try {
  error.message // This throws
} catch {}

normalizeException(error).message // This does not throw
```

# Install

```bash
npm install normalize-exception
```

This package is an ES module and must be loaded using
[an `import` or `import()` statement](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
not `require()`.

# API

## normalizeException(error)

`error` `any`\
_Return value_: `Error`

`normalizeException()` never throws.

If `error` is an `Error` instance, it is returned. Any missing or invalid error
property is directly modified.

If it is not an `Error` instance, a new one is created and returned.

# Related projects

- [`modern-errors`](https://github.com/ehmicky/modern-errors): Handle errors
  like it's 2022 🔮
- [`error-type`](https://github.com/ehmicky/error-type): Create custom error
  types
- [`merge-error-cause`](https://github.com/ehmicky/merge-error-cause): Merge an
  error with its `cause`
- [`error-cause-polyfill`](https://github.com/ehmicky/error-cause-polyfill):
  Polyfill `error.cause`

# Support

For any question, _don't hesitate_ to [submit an issue on GitHub](../../issues).

Everyone is welcome regardless of personal background. We enforce a
[Code of conduct](CODE_OF_CONDUCT.md) in order to promote a positive and
inclusive environment.

# Contributing

This project was made with ❤️. The simplest way to give back is by starring and
sharing it online.

If the documentation is unclear or has a typo, please click on the page's `Edit`
button (pencil icon) and suggest a correction.

If you would like to help us fix a bug or add a new feature, please check our
[guidelines](CONTRIBUTING.md). Pull requests are welcome!

<!-- Thanks go to our wonderful contributors: -->

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore -->
<!--
<table><tr><td align="center"><a href="https://twitter.com/ehmicky"><img src="https://avatars2.githubusercontent.com/u/8136211?v=4" width="100px;" alt="ehmicky"/><br /><sub><b>ehmicky</b></sub></a><br /><a href="https://github.com/ehmicky/normalize-exception/commits?author=ehmicky" title="Code">💻</a> <a href="#design-ehmicky" title="Design">🎨</a> <a href="#ideas-ehmicky" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ehmicky/normalize-exception/commits?author=ehmicky" title="Documentation">📖</a></td></tr></table>
 -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
