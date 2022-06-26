[![Codecov](https://img.shields.io/codecov/c/github/ehmicky/normalize-exception.svg?label=tested&logo=codecov)](https://codecov.io/gh/ehmicky/normalize-exception)
[![Node](https://img.shields.io/node/v/normalize-exception.svg?logo=node.js)](https://www.npmjs.com/package/normalize-exception)
[![Twitter](https://img.shields.io/badge/%E2%80%8B-twitter-brightgreen.svg?logo=twitter)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/%E2%80%8B-medium-brightgreen.svg?logo=medium)](https://medium.com/@ehmicky)

Normalize exceptions/errors.

In JavaScript, one can `throw` any value including strings, objects (like
`{ message: "..." }`) or even `undefined`. This normalizes any exception
[to an `Error` instance](#invalid-types).

It also fixes any missing or [invalid error properties](#invalid-properties):
`name`, `message`, [`stack`](#invalid-stack), `cause`, `errors`.

# Examples

## Invalid types

<!-- eslint-disable unicorn/no-null, no-throw-literal -->

```js
import normalizeException from 'normalize-exception'

try {
  throw null
} catch (error) {
  const normalizedError = normalizeException(error)
  console.log(normalizedError) // Error: null
  // Without `normalizeException()`, this would throw
  console.log(normalizedError.name)
}
```

```js
console.log(normalizeException('message')) // Error: message
```

```js
console.log(normalizeException({ name: 'TypeError', message: 'message' })) // TypeError: message
```

## Invalid stack

```js
const error = new TypeError('message')
console.log(error.stack) // TypeError: message

// `error.stack` is cached, so it does not update
error.message += ' otherMessage'
console.log(error.stack) // TypeError: message

const normalizedError = normalizeException(error)
console.log(normalizedError.stack) // TypeError: message otherMessage
```

## Invalid properties

```js
const error = new Error('message', { cause: 'innerError' })
console.log(error.cause instanceof Error) // false

const normalizedError = normalizeException(error)
console.log(normalizedError.cause instanceof Error) // true
console.log(normalizedError.cause) // Error: innerError
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
