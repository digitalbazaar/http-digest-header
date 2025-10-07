/*!
 * Copyright (c) 2019-2025 Digital Bazaar, Inc. All rights reserved.
 */
import {fromUint8Array as base64Encode} from 'js-base64';
import {encode as base64urlEncode} from 'base64url-universal';
import crypto from './crypto.js';

/**
 * Creates a value suitable for the HTTP `Digest` header.
 *
 * @param {object} options - The options to use.
 * @param {string|object|Blob|Uint8Array} [options.data] - Input body to be
 *   hashed (typically a request body).
 * @param {string} [options.algorithm] - Hash algorithm to use.
 *   (e.g. 'sha256').
 * @param {boolean} [options.useMultihash] - Whether to encode via multihash.
 *   If false, the hash will be base64 encoded (non-url).
 *
 * @returns {Promise<string>} Resolves to `Digest` header value.
 */
export async function createHeaderValue({
  data, algorithm = 'sha256', useMultihash = true
} = {}) {
  const body = _normalizeData(data);
  const {key, encodedDigest} = await _createHeaderValueComponents({
    body, algorithm, useMultihash
  });
  return `${key}=${encodedDigest}`;
}

/**
 * Verifies the HTTP `Digest` header value against the given HTTP body `data`.
 *
 * @param {object} options - The options to use.
 * @param {string|object|Blob} options.data - The data to be verified.
 * @param {string} options.headerValue - The digest header value to verify
 *   the data against.
 *
 * @returns {Promise<object>} - Resolves to an object with `verified` set to
 *   `true` or `false`.
 */
export async function verifyHeaderValue({data, headerValue}) {
  try {
    const {key, algorithm, encodedDigest} = _parseHeaderValue(headerValue);
    const body = _normalizeData(data);
    const {encodedDigest: expectedDigest} = await _createHeaderValueComponents(
      {body, algorithm, useMultihash: key === 'mh'});
    return {verified: encodedDigest === expectedDigest};
  } catch(error) {
    return {verified: false, error};
  }
}

/**
 * Creates the digest header components.
 *
 * @param {object} options - The options to use.
 * @param {Blob} options.body - The request body.
 * @param {string} [options.algorithm] - The hash algorithm to use.
 * @param {boolean} [options.useMultihash=true] - Whether to serialize digest
 *   using multihash or not.
 *
 * @returns {Promise<object>} - The header key and encoded digest in an object.
 */
async function _createHeaderValueComponents({
  body, algorithm = 'sha256', useMultihash = true
}) {
  if(algorithm !== 'sha256') {
    throw new Error(`Algorithm "${algorithm}" is not supported.`);
  }
  // `Blob.bytes()` is only available in node.js 22+;
  // fallback to `Blob.arrayBuffer()`
  const data = await (body?.bytes?.() ?? body.arrayBuffer());
  const digest = await _getDigest({data, algorithm});
  if(useMultihash) {
    return {key: 'mh', encodedDigest: _createMultihash({digest})};
  }
  return {key: 'SHA-256', encodedDigest: base64Encode(digest)};
}

function _createMultihash({digest}) {
  // format as multihash digest
  // sha2-256: 0x12, length: 32 (0x20), digest value
  const mh = new Uint8Array(34);
  mh[0] = 0x12;
  mh[1] = 0x20;
  mh.set(digest, 2);
  // encode multihash using multibase, base64url: `u`
  return `u${base64urlEncode(mh)}`;
}

function _parseHeaderValue(headerValue) {
  const [key, encodedDigest] = headerValue.split(/=(.+)/);

  let algorithm;
  if(key === 'mh') {
    // if `encodedDigest` starts with `uEi`, then it is a base64url-encoded
    // sha-256 multihash
    if(encodedDigest.startsWith('uEi')) {
      algorithm = 'sha256';
    } else {
      throw new Error(
        `Only base64url-encoded, sha-256 multihash is supported.`);
    }
  } else {
    algorithm = key.replace('-', '').toLowerCase();
    if(algorithm !== 'sha256') {
      throw new Error(`Algorithm "${algorithm}" is not supported.`);
    }
  }
  return {key, algorithm, encodedDigest};
}

async function _getDigest({data, algorithm}) {
  if(algorithm === 'sha256') {
    return new Uint8Array(await crypto.subtle.digest({name: 'SHA-256'}, data));
  }
  throw new Error(`Algorithm "${algorithm}" is not unsupported.`);
}

// normalize all inputs to a Uint8Array for hashing
function _normalizeData(data) {
  if(data instanceof Uint8Array) {
    return new Blob([/** @type {ArrayBuffer} */ (data.buffer)]);
  }
  if(data instanceof ArrayBuffer) {
    return new Blob([data]);
  }
  if(typeof data === 'string') {
    return new Blob([data], {type: 'application/json'});
  }
  if(typeof data?.arrayBuffer === 'function') {
    return data;
  }
  return new Blob([JSON.stringify(data)], {type: 'application/json'});
}
