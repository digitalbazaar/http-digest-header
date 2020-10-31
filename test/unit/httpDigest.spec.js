/*!
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
import httpDigest from '../../';
import chai from 'chai';
chai.should();

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

  it('should create a digest of an object', async () => {
    const data = {hello: 'world'};
    const objDigest = await httpDigest.create(
      {data, algorithm: 'sha256', useMultihash: false}
    );
    const stringDigest = await httpDigest.create(
      {data: '{"hello":"world"}', algorithm: 'sha256', useMultihash: false}
    );

    objDigest.should.equal(stringDigest);
    objDigest.should
      .equal('SHA-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg=');
  });
});
