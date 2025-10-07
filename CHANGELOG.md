# @digitalbazaar/http-digest-header Changelog

## 2.1.0 - 2025-mm-dd

### Added
- Support passing `Blob` or `Uint8Array` as the request/response body `data`
  parameter when creating or verifying a header value.

### Changed
- Recommend node>=20 instead of node>=14.
- Remove now obsolete webcrypto platform differentiation/browser alias code.

## 2.0.0 - 2022-06-06

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
