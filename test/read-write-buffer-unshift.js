"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Write/Read buffer [unshift]', function () {
  it('writeBuffer/readBuffer [native][unshift]', function() {
    const buffer = new ExtendedBuffer();
    const nativeDataBuffer1 = Buffer.from('1111111111', 'utf8');
    const nativeDataBuffer2 = Buffer.from('2222222222', 'utf8');

    buffer.writeBuffer(nativeDataBuffer1);
    buffer.writeBuffer(nativeDataBuffer2, true);

    expect(Buffer.compare(
      buffer.readBuffer(nativeDataBuffer2.length, true),
      nativeDataBuffer2
    )).to.equal(0);

    expect(Buffer.compare(
      buffer.readBuffer(nativeDataBuffer1.length, true),
      nativeDataBuffer1
    )).to.equal(0);
  });

  it('writeBuffer/readBuffer [ExtendedBuffer][unshift]', function() {
    const buffer = new ExtendedBuffer();
    const dataBuffer1 = (new ExtendedBuffer()).writeNativeBuffer(Buffer.from('1111111111', 'utf8'));
    const dataBuffer2 = (new ExtendedBuffer()).writeNativeBuffer(Buffer.from('2222222222', 'utf8'));

    buffer.writeBuffer(dataBuffer1);
    buffer.writeBuffer(dataBuffer2, true);

    expect(Buffer.compare(
      buffer.readBuffer(dataBuffer2.length, false).nativeBufferView,
      dataBuffer2.nativeBufferView
    )).to.equal(0);

    expect(Buffer.compare(
      buffer.readBuffer(dataBuffer1.length, false).nativeBufferView,
      dataBuffer1.nativeBufferView
    )).to.equal(0);
  });
});
