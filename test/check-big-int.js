"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;
const ExtendedBufferRangeError = require('..').ExtendedBufferRangeError;
const ExtendedBufferUnsupportedError = require('..').ExtendedBufferUnsupportedError;

let isSupported = false;

try {
  isSupported = typeof BigInt(0) === 'bigint';
} catch (e) {}

if (isSupported && typeof Buffer.prototype.readBigUInt64LE === 'function') {
  describe('Test BigInt [SUPPORTED]', function () {
    it('Test #1', function() {
      const buffer = new ExtendedBuffer();
      buffer.writeBigInt64BE(BigInt(1));
      buffer.writeBigInt64LE(BigInt(2));
      buffer.writeBigUInt64BE(BigInt(3));
      buffer.writeBigUInt64LE(BigInt(4));

      expect(buffer.readBigInt64BE()).to.equal(BigInt(1));
      expect(buffer.readBigInt64LE()).to.equal(BigInt(2));
      expect(buffer.readBigUInt64BE()).to.equal(BigInt(3));
      expect(buffer.readBigUInt64LE()).to.equal(BigInt(4));
    });

    it('Test #2', function() {
      const buffer = new ExtendedBuffer();
      buffer.writeBigInt64BE(BigInt(1), true);
      buffer.writeBigInt64LE(BigInt(2), true);
      buffer.writeBigUInt64BE(BigInt(3), true);
      buffer.writeBigUInt64LE(BigInt(4), true);

      expect(buffer.readBigUInt64LE()).to.equal(BigInt(4));
      expect(buffer.readBigUInt64BE()).to.equal(BigInt(3));
      expect(buffer.readBigInt64LE()).to.equal(BigInt(2));
      expect(buffer.readBigInt64BE()).to.equal(BigInt(1));
    });

    it('Test #3', function() {
      const buffer = new ExtendedBuffer();

      expect(function() {
        buffer.readBigUInt64LE();
      }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
    });
  });
} else {
  describe('Test BigInt [UNSUPPORTED]', function () {
    it('Test #1', function() {
      const buffer = new ExtendedBuffer();

      expect(function() {
        buffer.writeBigInt64BE(0);
      }).to.throw('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT').instanceOf(ExtendedBufferUnsupportedError);

      expect(function() {
        buffer.writeBigInt64LE(0);
      }).to.throw('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT').instanceOf(ExtendedBufferUnsupportedError);

      expect(function() {
        buffer.writeBigUInt64BE(0);
      }).to.throw('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT').instanceOf(ExtendedBufferUnsupportedError);

      expect(function() {
        buffer.writeBigUInt64LE(0);
      }).to.throw('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT').instanceOf(ExtendedBufferUnsupportedError);
    });

    it('Test #2', function() {
      const buffer = new ExtendedBuffer();

      expect(function() {
        buffer.readBigInt64BE();
      }).to.throw('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT').instanceOf(ExtendedBufferUnsupportedError);

      expect(function() {
        buffer.readBigInt64LE();
      }).to.throw('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT').instanceOf(ExtendedBufferUnsupportedError);

      expect(function() {
        buffer.readBigUInt64BE();
      }).to.throw('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT').instanceOf(ExtendedBufferUnsupportedError);

      expect(function() {
        buffer.readBigUInt64LE();
      }).to.throw('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT').instanceOf(ExtendedBufferUnsupportedError);
    });
  });
}
