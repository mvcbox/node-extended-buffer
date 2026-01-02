"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Transactional work with a buffer', function () {
  it('[Transaction] Test success case', function() {
    const buffer = new ExtendedBuffer();
    expect(buffer.length).to.equal(0);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(0);

    expect(buffer.transaction(() => {
      buffer.writeUInt32BE(1);

      buffer.transaction(() => {
        buffer.writeUInt32BE(2);
      });

      buffer.writeUInt32BE(3);
      return buffer;
    })).to.equal(buffer).instanceOf(ExtendedBuffer);

    expect(buffer.length).to.equal(12);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(12);
    expect(buffer.readUInt32BE()).to.equal(1);
    expect(buffer.readUInt32BE()).to.equal(2);
    expect(buffer.readUInt32BE()).to.equal(3);
  });

  it('[Transaction] Test error case #1', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeNativeBuffer(Buffer.from([1, 2, 3, 4, 5]));

    expect(buffer.length).to.equal(5);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(5);
    expect(Buffer.compare(buffer.nativeBufferView, Buffer.from([1, 2, 3, 4, 5]))).to.equal(0);

    expect(function() {
      buffer.transaction(() => {
        buffer.clean();
        buffer.writeUInt32BE(1);
        buffer.writeUInt32BE(2);
        buffer.writeUInt32BE(3);
        throw new Error('SOME_ERROR');
      });
    }).to.throw('SOME_ERROR').instanceOf(Error);

    expect(buffer.length).to.equal(5);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(5);
    expect(Buffer.compare(buffer.nativeBufferView, Buffer.from([1, 2, 3, 4, 5]))).to.equal(0);
  });

  it('[Transaction] Test error case #2', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeNativeBuffer(Buffer.from([1, 2, 3, 4, 5]));

    expect(buffer.length).to.equal(5);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(5);
    expect(Buffer.compare(buffer.nativeBufferView, Buffer.from([1, 2, 3, 4, 5]))).to.equal(0);

    expect(function() {
      buffer.transaction(() => {
        buffer.clean();
        buffer.writeUInt32BE(1);

        buffer.transaction(() => {
          buffer.writeUInt32BE(2);
          throw new Error('SOME_ERROR');
        });

        buffer.writeUInt32BE(3);
      });
    }).to.throw('SOME_ERROR').instanceOf(Error);

    expect(buffer.length).to.equal(5);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(5);
    expect(Buffer.compare(buffer.nativeBufferView, Buffer.from([1, 2, 3, 4, 5]))).to.equal(0);
  });
});
