"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Write/Read buffer', function () {
  it('writeBuffer/readBuffer [native]', function() {
    const buffer = new ExtendedBuffer();
    const nativeDataBuffer = Buffer.from('Some data...', 'utf8');

    buffer.writeBuffer(nativeDataBuffer);
    expect(buffer.length).to.equal(nativeDataBuffer.length);
    expect(buffer.getReadableSize()).to.equal(nativeDataBuffer.length);

    expect(Buffer.compare(
      buffer.readBuffer(nativeDataBuffer.length, true),
      nativeDataBuffer
    )).to.equal(0);
  });

  it('writeBuffer/readBuffer [ExtendedBuffer]', function() {
    const buffer = new ExtendedBuffer();
    const dataBuffer = (new ExtendedBuffer()).writeNativeBuffer(Buffer.from('Some data...', 'utf8'));

    buffer.writeBuffer(dataBuffer);
    expect(buffer.length).to.equal(dataBuffer.length);
    expect(buffer.getReadableSize()).to.equal(dataBuffer.length);

    expect(Buffer.compare(
      buffer.readBuffer(dataBuffer.length, false).nativeBufferView,
      dataBuffer.nativeBufferView
    )).to.equal(0);
  });

  it('writeBuffer/readBuffer with options [ExtendedBuffer]', function() {
    const buffer = new ExtendedBuffer({
      capacity: 1024,
      capacityStep: 1024
    });

    buffer.writeUInt8(1);
    buffer.writeUInt8(2);
    buffer.writeUInt8(3);

    expect(buffer.length).to.equal(3);
    expect(buffer.capacity).to.equal(1024);
    expect(buffer.pointer).to.equal(0);

    const buffer2 = buffer.readBuffer(buffer.length, false, {
      capacity: 0,
      capacityStep: 0,
      nativeAllocSlow: true,
      nativeReallocSlow: true
    });

    expect(buffer.pointer).to.equal(3);
    expect(buffer2.pointer).to.equal(0);
    expect(buffer2.length).to.equal(3);
    expect(buffer2.capacity).to.equal(3);
  });
});
