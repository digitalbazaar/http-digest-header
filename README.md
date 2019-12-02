# HTTP Digest Header Library _(http-signature-digest)_

[![Build status](https://img.shields.io/travis/digitalbazaar/http-signature-digest.svg)](https://travis-ci.org/digitalbazaar/http-signature-digest)

> JavaScript library (Node.js and browser) for creating and verifying Digest headers for HTTP Signatures

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Background

**[HTTP Signatures IETF draft](https://tools.ietf.org/html/draft-cavage-http-signatures)**

This is a library specifically for creating and verifying the `Digest:` header,
for use with HTTP Signatures and similar mechanisms.

This is a standalone separate library from 
[`http-signature-header`](https://github.com/digitalbazaar/http-signature-header)
so as not to introduce dependencies on cryptographic libraries to that lib.

It's intended to be isomorphic (for use both in the browser and server-side, with
Node.js).

## Install

To install from `npm`:

```
npm install http-signature-digest
```

To install locally (for development):

```
git clone https://github.com/digitalbazaar/http-signature-digest.git
cd http-signature-digest
npm install
```

## Usage

```js
const httpDigest = require('http-signature-digest');

const data = `{"hello": "world"}`;

const result = await httpDigest.
    createDigestString({data, algorithm: 'sha256', useMultihash: false});

// -> SHA-256=X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=
```

## Contribute

Please follow the existing code style.

PRs accepted.

If editing the Readme, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## Commercial Support

Commercial support for this library is available upon request from
Digital Bazaar: support@digitalbazaar.com

## License

[BSD-3-Clause](LICENSE.md) © Digital Bazaar
