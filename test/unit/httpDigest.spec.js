/*!
 * Copyright (c) 2019-2025 Digital Bazaar, Inc. All rights reserved.
 */
import {createHeaderValue, verifyHeaderValue} from '../../lib/index.js';

describe('http-signature-digest', () => {
  describe('createDigestString', () => {
    it('should create a digest of a given string', async () => {
      const data = `{"hello": "world"}`;
      let result;
      let err;
      try {
        result = await createHeaderValue(
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
          result = await createHeaderValue({data, useMultihash: true});
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
      const objDigest = await createHeaderValue(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      let stringDigest;
      let err;
      try {
        stringDigest = await createHeaderValue({
          data: '{"hello":"world"}',
          algorithm: 'sha256',
          useMultihash: false
        });
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(stringDigest);
      objDigest.should.equal(stringDigest);
      objDigest.should
        .equal('SHA-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg=');
    });

    it('should create a digest of a JSON blob', async () => {
      const object = {hello: 'world'};
      const data = new Blob(
        [JSON.stringify(object)], {type: 'application/json'});
      const objDigest = await createHeaderValue(
        {data, algorithm: 'sha256', useMultihash: false});
      objDigest.should
        .equal('SHA-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg=');
    });

    it('should create a digest of a text/plain blob', async () => {
      const object = {hello: 'world'};
      const data = new Blob([JSON.stringify(object)], {type: 'text/plain'});
      const objDigest = await createHeaderValue(
        {data, algorithm: 'sha256', useMultihash: false});
      objDigest.should
        .equal('SHA-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg=');
    });

    it('should create a digest of a Uint8Array', async () => {
      const object = {hello: 'world'};
      const text = JSON.stringify(object);
      const data = new TextEncoder().encode(text);
      should.equal(data instanceof Uint8Array, true, `data is a Uint8Array`);
      const objDigest = await createHeaderValue(
        {data, algorithm: 'sha256', useMultihash: false});
      objDigest.should
        .equal('SHA-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg=');
    });

    it('should create a digest of an object with useMultihash set to true',
      async () => {
        const data = {hello: 'world'};
        const headerValue = await createHeaderValue({data, useMultihash: true});
        let stringHeaderValue;
        let err;
        try {
          stringHeaderValue = await createHeaderValue(
            {data: '{"hello":"world"}', useMultihash: true}
          );
        } catch(e) {
          err = e;
        }
        should.not.exist(err);
        should.exist(stringHeaderValue);
        headerValue.should.equal(stringHeaderValue);
        headerValue.should
          .equal('mh=uEiCTojlxqRTl6svwqNJRVM2jCcPBxy-7mRTUfGDzy2gViA');
      });
  });
  describe('verifyDigestString', () => {
    it('should verify a digest of a given string', async () => {
      const data = `{"hello": "world"}`;
      const headerValue = await createHeaderValue(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      let verifyResult;
      let err;
      try {
        verifyResult = await verifyHeaderValue({data, headerValue});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(true);
    });
    it('should verify a digest of a given object', async () => {
      const data = {hello: 'world'};
      const headerValue = await createHeaderValue(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      let verifyResult;
      let err;
      try {
        verifyResult = await verifyHeaderValue({data, headerValue});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(true);
    });
    it('should verify a digest wrapped in colons', async () => {
      const data = `{"hello": "world"}`;
      const headerValue =
        `sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:`;
      let verifyResult;
      let err;
      try {
        verifyResult = await verifyHeaderValue({data, headerValue});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(true);
    });
    it('should verify false if a multihash digest is wrapped in colons',
      async () => {
        const data = '{"hello":"world"}';
        const headerValue =
          `mh=:uEiCTojlxqRTl6svwqNJRVM2jCcPBxy-7mRTUfGDzy2gViA:`;
        let verifyResult;
        let err;
        try {
          verifyResult = await verifyHeaderValue({data, headerValue});
        } catch(e) {
          err = e;
        }
        should.not.exist(err);
        should.exist(verifyResult);
        verifyResult.verified.should.equal(false);
      });
    it('should verify false if verifying bad data object', async () => {
      const data = {hello: 'world'};
      const headerValue = await createHeaderValue(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      const dataToVerify = {hello: 'earth'};
      let verifyResult;
      let err;
      try {
        verifyResult = await verifyHeaderValue({
          data: dataToVerify, headerValue});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(false);
    });
    it('should verify false if verifying bad data string', async () => {
      const data = `{"hello": "world"}`;
      const headerValue = await createHeaderValue(
        {data, algorithm: 'sha256', useMultihash: false}
      );
      const dataToVerify = `{"hello": "earth"}`;
      let verifyResult;
      let err;
      try {
        verifyResult = await verifyHeaderValue({
          data: dataToVerify, headerValue});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(false);
    });
    it('should verify false if hashedDigestStringValue and headerValue ' +
     'are not equal when header is multihash', async () => {
      const data = `{"hello": "world"}`;
      const headerValue = await createHeaderValue(
        {data, useMultihash: true}
      );
      const dataToVerify = `{"hello": "earth"}`;
      let verifyResult;
      let err;
      try {
        verifyResult = await verifyHeaderValue({
          data: dataToVerify, headerValue});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(false);
    });
    it('should verify true if hashedDigestStringValue and headerValue ' +
      'are equal when header is multihash', async () => {
      const data = `{"hello": "world"}`;
      const headerValue = await createHeaderValue(
        {data, useMultihash: true}
      );
      let verifyResult;
      let err;
      try {
        verifyResult = await verifyHeaderValue({data, headerValue});
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.exist(verifyResult);
      verifyResult.verified.should.equal(true);
    });
  });
});
