/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
import base64url from 'base64url';
import crypto from './crypto';

async function create(
  {data, algorithm = 'sha256', useMultihash = true}) {
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

  return `SHA-256=${base64url.toBase64(base64url.encode(digest))}`;
};

export default {
  create
};
