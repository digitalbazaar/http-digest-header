/*!
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
import httpDigest from '../../';

describe('http-signature-digest', () => {
  describe('createDigestString', () => {
    it('should create a digest of a given string', async () => {
      const data = `{"hello": "world"}`;
      let result;
      let err;
      try {
        result = await httpDigest.create(
          {data, algorithm: 'sha256', useMultihash: false}
        );
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(result);
      result.should
        .equal('SHA-256=X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=');
    });
    it('should create a digest of a given string with useMultihash set to true',
      async () => {
        const data = `{"hello": "world"}`;
        let result;
        let err;
        try {
          result = await httpDigest.create(
            {data, useMultihash: true});
        } catch(e) {
          err = e;
        }
        should.not.exist(err);
        should.exist(result);
        result.should.
          equal('mh=uEiBfjwT2o6iSqqu922zyc4lEk3c5YNSjJbEF_uRu70ME8Q');
      });

    it('should create a digest of an object', async () => {
      const data = {hello: 'world'};
      const objDigest = await httpDigest.create(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      let stringDigest;
      let err;
      try {
        stringDigest = await httpDigest.create({
          data: '{"hello":"world"}',
          algorithm: 'sha256',
          useMultihash: false});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(stringDigest);
      objDigest.should.equal(stringDigest);
      objDigest.should
        .equal('SHA-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg=');
    });

    it('should create a digest of an object with useMultihash set to true',
      async () => {
        const data = {hello: 'world'};
        const objDigest = await httpDigest.create(
          {data, useMultihash: true}
        );
        let stringDigest;
        let err;
        try {
          stringDigest = await httpDigest.create(
            {data: '{"hello":"world"}', useMultihash: true}
          );
        } catch(e) {
          err = e;
        }
        should.not.exist(err);
        should.exist(stringDigest);
        objDigest.should.equal(stringDigest);
        objDigest.should
          .equal('mh=uEiCTojlxqRTl6svwqNJRVM2jCcPBxy-7mRTUfGDzy2gViA');
      });
  });
  describe('verifyDigestString', () => {
    it('should verify a digest of a given string', async () => {
      const data = `{"hello": "world"}`;
      const digest = await httpDigest.create(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      let verifyResult;
      let err;
      try {
        verifyResult = await httpDigest.verify({data, header: digest});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(true);
    });
    it('should verify a digest of a given object', async () => {
      const data = {hello: 'world'};
      const digest = await httpDigest.create(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      let verifyResult;
      let err;
      try {
        verifyResult = await httpDigest.verify({data, header: digest});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(true);
    });
    it('should verify false if verifying bad data object', async () => {
      const data = {hello: 'world'};
      const digest = await httpDigest.create(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      const dataToVerify = {hello: 'earth'};
      let verifyResult;
      let err;
      try {
        verifyResult = await httpDigest.verify({
          data: dataToVerify, header: digest});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(false);
    });
    it('should verify false if verifying bad data string', async () => {
      const data = `{"hello": "world"}`;
      const digest = await httpDigest.create(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      const dataToVerify = `{"hello": "earth"}`;
      let verifyResult;
      let err;
      try {
        verifyResult = await httpDigest.verify({
          data: dataToVerify, header: digest});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(false);
    });
  });
});
