"use strict";

const crypto  = require('crypto');
const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Init native buffer / Buffer view', function () {
  it('Test initNativeBuffer', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeNativeBuffer(crypto.randomBytes(1024));

    expect(buffer.length).to.equal(1024);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(1024);

    const buffer2 = new ExtendedBuffer({
      initNativeBuffer: buffer.nativeBufferView
    });

    expect(buffer2.length).to.equal(1024);
    expect(buffer2.capacity).to.equal(1024);
    expect(buffer2.pointer).to.equal(0);
    expect(buffer2.nativeBufferView.length).to.equal(1024);
    expect(Buffer.compare(buffer.nativeBufferView, buffer2.nativeBufferView)).to.equal(0);

    buffer.nativeBufferView[0] = 1;
    buffer.nativeBufferView[1] = 3;
    buffer.nativeBufferView[2] = 4;

    expect(Buffer.compare(buffer.nativeBufferView, buffer2.nativeBufferView)).to.equal(0);
  });

  it('Test bufferView()', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeNativeBuffer(crypto.randomBytes(1024));

    expect(buffer.length).to.equal(1024);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(1024);

    const buffer2 = buffer.bufferView;

    expect(buffer2.length).to.equal(1024);
    expect(buffer2.capacity).to.equal(1024);
    expect(buffer2.pointer).to.equal(0);
    expect(buffer2.nativeBufferView.length).to.equal(1024);
    expect(Buffer.compare(buffer.nativeBufferView, buffer2.nativeBufferView)).to.equal(0);

    buffer.nativeBufferView[0] = 1;
    buffer.nativeBufferView[1] = 3;
    buffer.nativeBufferView[2] = 4;

    expect(Buffer.compare(buffer.nativeBufferView, buffer2.nativeBufferView)).to.equal(0);
  });
});
