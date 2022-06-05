[![Codecov](https://img.shields.io/codecov/c/github/ehmicky/normalize-exception.svg?label=tested&logo=codecov)](https://codecov.io/gh/ehmicky/normalize-exception)
[![Build](https://github.com/ehmicky/normalize-exception/workflows/Build/badge.svg)](https://github.com/ehmicky/normalize-exception/actions)
[![Node](https://img.shields.io/node/v/normalize-exception.svg?logo=node.js)](https://www.npmjs.com/package/normalize-exception)
[![Twitter](https://img.shields.io/badge/%E2%80%8B-twitter-4cc61e.svg?logo=twitter)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/%E2%80%8B-medium-4cc61e.svg?logo=medium)](https://medium.com/@ehmicky)

Normalize exceptions/errors.

JavaScript can `throw` any value including strings, objects
(`{ message: "..." }`) or even `undefined`. This normalizes those exceptions to
`Error` instances.

It also fixes any missing or invalid error properties: `name`, `message`,
`stack`, `cause`, `errors`.

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
