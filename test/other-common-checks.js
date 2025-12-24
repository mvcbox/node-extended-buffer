"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;
const assertIntegerSize = require('..').assertIntegerSize;
const allocNativeBuffer = require('..').allocNativeBuffer;
const reallocNativeBuffer = require('..').reallocNativeBuffer;
const ExtendedBufferError = require('..').ExtendedBufferError;
const ExtendedBufferTypeError = require('..').ExtendedBufferTypeError;
const ExtendedBufferRangeError = require('..').ExtendedBufferRangeError;

describe('Other common checks', function () {
  it('buffer.clean()', function() {
    const buffer = new ExtendedBuffer();

    expect(buffer.length).to.equal(0);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(0);

    buffer.writeUInt8(123);

    expect(buffer.length).to.equal(1);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(1);

    buffer.clean();

    expect(buffer.length).to.equal(0);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(0);
  });

  it('buffer.gc()', function() {
    const buffer = new ExtendedBuffer({
      capacity: 0,
      capacityStep: 0
    });

    expect(buffer.length).to.equal(0);
    expect(buffer.capacity).to.equal(0);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(0);

    buffer.writeUInt8(123);
    buffer.writeUInt8(123);
    buffer.writeUInt8(123);

    expect(buffer.length).to.equal(3);
    expect(buffer.capacity).to.equal(3);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(3);

    buffer.readUInt8();

    expect(buffer.length).to.equal(3);
    expect(buffer.capacity).to.equal(3);
    expect(buffer.pointer).to.equal(1);
    expect(buffer.nativeBufferView.length).to.equal(3);

    buffer.gc();

    expect(buffer.length).to.equal(2);
    expect(buffer.capacity).to.equal(2);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(2);
  });

  it('buffer.nodeGc()', function() {
    const buffer = new ExtendedBuffer({
      capacity: 0,
      capacityStep: 0
    });

    buffer.writeUInt8(123);
    buffer.writeUInt8(123);
    buffer.writeUInt8(123);
    buffer.readUInt8();
    buffer.gc();
    buffer.nodeGc();
  });

  it('reallocNativeBuffer()', function() {
    const buffer1 = Buffer.from([1, 2, 3]);
    const buffer2 = reallocNativeBuffer(buffer1, buffer1.length);
    expect(buffer1).to.equal(buffer2);
    expect(Buffer.compare(buffer1, buffer2)).to.equal(0);
  });

  it('assertIntegerSize()', function() {
    expect(function() {
      assertIntegerSize(3.3);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_TYPE').instanceOf(ExtendedBufferTypeError);

    expect(function() {
      assertIntegerSize(0);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);

    expect(function() {
      assertIntegerSize(7);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('allocNativeBuffer()', function() {
    expect(function() {
      allocNativeBuffer(Number.MAX_SAFE_INTEGER);
    }).to.throw('EXCEEDING_MAXIMUM_BUFFER_SIZE').instanceOf(ExtendedBufferRangeError);
  });
});
