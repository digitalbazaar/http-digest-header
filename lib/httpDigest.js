/*!
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
import {fromUint8Array as base64Encode} from 'js-base64';
import {encode as base64urlEncode} from 'base64url-universal';
import crypto from './crypto.js';

/**
 * subset of Blob used by this module.
 * Don't rely on methods like '.bytes()' that were only added to nodejs in 22. `.arrayBuffer()` was in 16.
 *
 * @typedef {Pick<Blob, 'arrayBuffer'|'type'|'size'>} BlobArrayBuffer
 */

/**
 * Creates a value suitable for the HTTP `Digest` header.
 *
 * @param {object} options - The options to use.
 * @param {string|object|BlobArrayBuffer|ArrayBuffer|Uint8Array} [options.data] - Objects to be hashed
 *   (typically headers).
 * @param {string} [options.algorithm] - Hash algorithm to use.
 *   (e.g. 'sha256').
 * @param {boolean} [options.useMultihash] - Whether to encode via multihash.
 *   If false, the hash will be base64 encoded (non-url).
 *
 * @returns {Promise<string>} Resolves to `Digest` header value.
 */
export async function createHeaderValue(
  {data, algorithm = 'sha256', useMultihash = true} = {}) {
  const body = _createDataBlob(data)
  const {key, encodedDigest} = await _createHeaderValueComponents(
    {body, algorithm, useMultihash});
  return `${key}=${encodedDigest}`;
}

/**
 * some of functions in this module accept several types for 'data'.
 * this normalizes any/all of those to a Blob, which is like data but also carries a .type.
 * @param {string|object|BlobArrayBuffer|Uint8Array|ArrayBuffer} data - if string, will be assumed to be JSON (for back compat)
 * @returns {BlobArrayBuffer}
 */
function _createDataBlob(data) {
  if (data instanceof Uint8Array) return new Blob([/** @type {ArrayBuffer} */ (data.buffer)])
  if (data instanceof ArrayBuffer) return new Blob([data])
  if (typeof data === 'string') return new Blob([data],{type:'application/json'})
  if (typeof data?.arrayBuffer === 'function') return data
  return new Blob([JSON.stringify(data)],{type:'application/json'})
}

/**
 * Verifies the HTTP `Digest` header value against the given HTTP body `data`.
 *
 * @param {object} options - The options to use.
 * @param {string|object|BlobArrayBuffer} options.data - The data to be verified.
 * @param {string} options.headerValue - The digest header value to verify
 *   the data against.
 *
 * @returns {Promise<object>} - Resolves to an object with `verified` set to
 *   `true` or `false`.
 */
export async function verifyHeaderValue({data, headerValue}) {
  try {
    const {key, algorithm, encodedDigest} = _parseHeaderValue(headerValue);
    const body = _createDataBlob(data)
    const {encodedDigest: expectedDigest} = await _createHeaderValueComponents(
      {body, algorithm, useMultihash: key === 'mh'});
    return {verified: encodedDigest === expectedDigest};
  } catch(error) {
    return {verified: false, error};
  }
}

/**
 * @param {object} options
 * @param {BlobArrayBuffer} options.body - request body
 * @param {string} [options.algorithm] - whether to serialize digest using multihash or not
 * @param {boolean} [options.useMultihash=true] - whether to serialize digest using multihash or not
 */
async function _createHeaderValueComponents(
  {body, algorithm = 'sha256', useMultihash = true}) {
  if(algorithm !== 'sha256') {
    throw new Error(`Algorithm "${algorithm}" is not supported.`);
  }
  const data = await body.arrayBuffer()
  const digest = await _getDigest({data, algorithm});
  if(useMultihash) {
    return {key: 'mh', encodedDigest: _createMultihash({digest})};
  }
  return {key: 'SHA-256', encodedDigest: base64Encode(digest)};
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

/**
 * @param {object} options
 * @param {ArrayBuffer} options.data - data to get digest of
 * @param {'sha256'} options.algorithm - algorithm to use to digest
 * @returns 
 */
async function _getDigest({data, algorithm}) {
  if(algorithm === 'sha256') {
    return new Uint8Array(
      await crypto.subtle.digest({name: 'SHA-256'}, data));
  }
  throw new Error(`Algorithm "${algorithm}" is not unsupported.`);
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
