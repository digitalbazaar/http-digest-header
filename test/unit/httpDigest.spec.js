/*!
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
import httpDigest from '../../lib';
import chai from 'chai';

chai.should();
const {expect} = chai;

describe('http-signature-digest', () => {
  describe('createDigestString', () => {
    it('should create a digest of a given string', async () => {
      const data = `{"hello": "world"}`;
      const result = await httpDigest.create(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      result.should
        .equal('SHA-256=X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=');
    });
  });
});
