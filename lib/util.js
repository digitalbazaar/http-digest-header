/*!
 * Copyright (c) 2021-2025 Digital Bazaar, Inc. All rights reserved.
 */
export function base64Encode(bytes) {
  return Buffer.from(bytes).toString('base64');
}

export function base64urlEncode(bytes) {
  return Buffer.from(bytes).toString('base64url');
}
