# 2.5.1

## Bug fixes

- Fix generation of `error.stack` when missing

# 2.5.0

## Features

- Improve generation of `error.stack` when missing

# 2.4.0

## Features

- Improve `error.name` normalization

# 2.3.2

## Bug fixes

- Fix TypeScript types

# 2.3.1

## Bug fixes

- Fix TypeScript types

# 2.3.0

## Features

- Improve TypeScript types

# 2.2.0

## Features

- Add [`shallow` option](README.md#shallow) to prevent recursing on
  `error.cause` and `error.errors`

# 2.1.0

## Features

- Improve `error.stack` generation when it's missing

# 2.0.0

## Breaking changes

- Ensure `error.stack` normalization works in any browser

# 1.9.0

## Features

- Ensure `error.constructor` is the correct one

# 1.8.0

## Features

- Ensure `error.name` matches `error.constructor.name`

# 1.7.0

## Features

- Improve TypeScript types

# 1.6.0

## Features

- Reduce npm package size

# 1.5.0

## Features

- Reduce npm package size

# 1.4.2

## Bug fixes

- Better handling of Node.js `--enable-source-maps` CLI flag

# 1.4.1

## Chore

- Update homepage in `package.json`

# 1.4.0

## Features

- Improve handling of errors that are plain objects

# 1.3.0

## Features

- Improve handling of errors that are `Proxy` instances

# 1.2.0

## Features

- Handle errors that are `Proxy` instances, by converting them to non-`Proxy`
- Handle error properties that are `get` functions that throw
