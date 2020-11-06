/*!
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
import base64url from './base64url.js';
import base64 from './base64.js';
import crypto from './crypto.js';

/**
 * Creates a string suitable for HTTP Digest: header.
 *
 * @param {object} options - The options to use.
 * @param {string|object} options.data - Objects to be hashed
 *   (typically headers).
 * @param {string} [options.algorithm] - Hash algorithm to use.
 *   (e.g. 'sha256').
 * @param {boolean} [options.useMultihash] - Whether to encode via multihash.
 *   If false, the hash will be base64 encoded (non-url).
 *
 * @returns {Promise<string>} Resolves with hashed digest string.
 */
async function create({data, algorithm = 'sha256', useMultihash = true}) {
  if(typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  algorithm = algorithm.toLowerCase();
  const digest = await _getDigest({data, algorithm});
  if(useMultihash) {
    return _createMultiHash({digest});
  }
  return `SHA-256=${base64.encode(digest)}`;
}

/**
 * Verifies digest of data created by create().
 *
 * @param {object} options - The options to use.
 * @param {string|object} options.data - The data to be verified.
 * @param {string} options.header - The digest header string to
 *   be verified against.
 *
 * @returns {object} - Returns an object with verified true or false.
 */
async function verify({data, header}) {
  if(typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  let digest;
  let encoded;
  const algorithm = header.split('=')[0].replace('-', '').toLowerCase();
  if(algorithm === 'sha256') {
    encoded = header.substring(header.indexOf('=') + 1);
    digest = await _getDigest({data, algorithm});
  } else if(algorithm === 'mh') {
    encoded = header.substring(header.indexOf('=') + 1).slice(1);
    digest = await _createMultiHash({digest});
  }
  const hashedBytes = new Uint8Array(base64url.decode(encoded));

  if(JSON.stringify(digest) !== JSON.stringify(hashedBytes)) {
    return {verified: false};
  }
  return {verified: true};
}

async function _getDigest({data, algorithm}) {
  const encodedData = new TextEncoder().encode(data);
  let digest;
  switch(algorithm) {
    case 'sha256': {
      digest = new Uint8Array(
        await crypto.subtle.digest({name: 'SHA-256'}, encodedData));

      break;
    }
    case 'hs2019': {
      // todo: support hs2019 / SHA-512
    }
    default: {
      throw new Error(`${algorithm} is not unsupported.`);
    }
  }
  return digest;
}

function _createMultiHash({digest}) {
  // format as multihash digest
  // sha2-256: 0x12, length: 32 (0x20), digest value
  const mh = new Uint8Array(34);
  mh[0] = 0x12;
  mh[1] = 0x20;
  mh.set(digest, 2);
  // encode multihash using multibase, base64url: `u`
  return `mh=u${base64url.encode(mh)}`;
}

export default {
  create,
  verify
};
