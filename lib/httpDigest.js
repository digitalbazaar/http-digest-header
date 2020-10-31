/*!
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
import base64url from './base64url.js';
import base64 from './base64.js';
import crypto from './crypto.js';

/**
 * Creates a string suitable for HTTP Digest: header.
 *
 * @param {string|object} data - Objects to be hashed (typically, headers).
 * @param {string} algorithm - Hash algorithm to use. (e.g. 'sha256').
 * @param {boolean} useMultihash - Whether to encode via multihash.
 *   If false, the hash will be base64 encoded (non-url).
 *
 * @returns {Promise<string>} Resolves with hashed digest string.
 */
async function create({data, algorithm = 'sha256', useMultihash = true}) {
  if(typeof data !== 'string') {
    data = JSON.stringify(data);
  }
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

  if(useMultihash) {
    // format as multihash digest
    // sha2-256: 0x12, length: 32 (0x20), digest value
    const mh = new Uint8Array(34);
    mh[0] = 0x12;
    mh[1] = 0x20;
    mh.set(digest, 2);
    // encode multihash using multibase, base64url: `u`
    return `mh=u${base64url.encode(mh)}`;
  }

  return `SHA-256=${base64.encode(digest)}`;
};

export default {
  create
};
