# HTTP Digest Header Library _(@digitalbazaar/http-digest-header)_

[![Build status](https://img.shields.io/travis/digitalbazaar/http-digest-header.svg)](https://travis-ci.org/digitalbazaar/http-digest-header)

> JavaScript library (Node.js and browser) for creating and verifying Digest headers for HTTP Signatures

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Background

Originally, this library was implemented on the `Digest` header as mentioned in
**[HTTP Signatures IETF draft](https://tools.ietf.org/html/draft-cavage-http-signatures)**.
Since then, the `Digest` header got its own standards-track spec, at
https://tools.ietf.org/html/draft-ietf-httpbis-digest-headers.

This is a library specifically for creating and verifying the `Digest:` header,
for use with HTTP Signatures and similar mechanisms.

This is a standalone separate library from 
[`http-digest-header`](https://github.com/digitalbazaar/http-digest-header)
so as not to introduce dependencies on cryptographic libraries to that lib.

It's intended to be isomorphic (for use both in the browser and server-side, 
with Node.js).

## Install

To install from `npm`:

```
npm install @digitalbazaar/http-digest-header
```

To install locally (for development):

```
git clone https://github.com/digitalbazaar/http-digest-header.git
cd http-digest-header
npm install
```

## Usage

```js
const httpDigest = require('@digitalbazaar/http-digest-header');

const data = `{"hello": "world"}`;

const result = await httpDigest.
    create({data, algorithm: 'sha256', useMultihash: false});

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

[BSD-3-Clause](LICENSE.md) © 2019-2020 Digital Bazaar
