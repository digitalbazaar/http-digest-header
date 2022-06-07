# @digitalbazaar/http-digest-header Changelog

## 2.0.0 - 2022-xx-xx

### Changed
- **BREAKING**: Convert to module (ESM).
- **BREAKING**: Require Node.js >=14.
- **BREAKING**: Use `globalThis` for browser crypto and streams.
- **BREAKING**: Require Web Crypto API. Older browsers and Node.js 14 users
  need to install an appropriate polyfill.
- Update dependencies.
- Lint module.

## 1.0.1 - 2021-06-02

### Fixed
- Enable karma tests.
- Switch from `universal-base64` to `js-base64` which handles Uint8Arrays
  properly.

## 1.0.0 - 2020-12-04

### Added
- Added core files.
- Added `createHeaderValue` and `verifyHeaderValue` functions.
- Added tests.
