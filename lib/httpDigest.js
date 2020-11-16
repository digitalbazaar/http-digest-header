/*!
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
import {encode as base64Encode} from 'universal-base64';
import {encode as base64urlEncode} from 'base64url-universal';
import crypto from './crypto.js';

/**
 * Creates a value suitable for the HTTP `Digest` header.
 *
 * @param {object} options - The options to use.
 * @param {string|object} options.data - Objects to be hashed
 *   (typically headers).
 * @param {string} [options.algorithm] - Hash algorithm to use.
 *   (e.g. 'sha256').
 * @param {boolean} options.useMultihash - Whether to encode via multihash.
 *   If false, the hash will be base64 encoded (non-url).
 *
 * @returns {Promise<string>} Resolves to `Digest` header value.
 */
export async function createHeaderValue(
  {data, algorithm = 'sha256', useMultihash = true} = {}) {
  const {key, encodedDigest} = await _createHeaderValueComponents(
    {data, algorithm, useMultihash});
  return `${key}=${encodedDigest}`;
}

/**
 * Verifies the HTTP `Digest` header value against the given HTTP body `data`.
 *
 * @param {object} options - The options to use.
 * @param {string|object} options.data - The data to be verified.
 * @param {string} options.headerValue - The digest header value to verify
 *   the data against.
 *
 * @returns {Promise<object>} - Resolves to an object with `verified` set to
 *   `true` or `false`.
 */
export async function verifyHeaderValue({data, headerValue} = {}) {
  try {
    const {key, algorithm, encodedDigest} = _parseHeaderValue(headerValue);
    const {encodedDigest: expectedDigest} = await _createHeaderValueComponents(
      {data, algorithm, useMultihash: key === 'mh'});
    return {verified: encodedDigest === expectedDigest};
  } catch(error) {
    return {verified: false, error};
  }
}

async function _createHeaderValueComponents(
  {data, algorithm = 'sha256', useMultihash = true} = {}) {
  if(typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  if(algorithm !== 'sha256') {
    throw new Error(`Algorithm "${algorithm}" is not supported.`);
  }
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

async function _getDigest({data, algorithm}) {
  const encodedData = new TextEncoder().encode(data);
  if(algorithm === 'sha256') {
    return new Uint8Array(
      await crypto.subtle.digest({name: 'SHA-256'}, encodedData));
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
