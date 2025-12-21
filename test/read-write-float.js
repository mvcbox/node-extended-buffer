"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Write/Read float', function () {
  it('writeFloatLE/readFloatLE', function() {
    const size = 4;
    const buffer = new ExtendedBuffer();

    buffer.writeFloatLE(1.0);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readFloatLE()).to.equal(1.0);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x0, 0x0, 0x80, 0x3F])
    )).to.equal(0);
  });

  it('writeFloatBE/readFloatBE', function() {
    const size = 4;
    const buffer = new ExtendedBuffer();

    buffer.writeFloatBE(1.0);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readFloatBE()).to.equal(1.0);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x3F, 0x80, 0x0, 0x0])
    )).to.equal(0);
  });

  it('writeDoubleLE/readDoubleLE', function() {
    const size = 8;
    const buffer = new ExtendedBuffer();

    buffer.writeDoubleLE(1.0);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readDoubleLE()).to.equal(1.0);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xF0, 0x3F])
    )).to.equal(0);
  });

  it('writeDoubleBE/readDoubleBE', function() {
    const size = 8;
    const buffer = new ExtendedBuffer();

    buffer.writeDoubleBE(1.0);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readDoubleBE()).to.equal(1.0);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x3F, 0xF0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])
    )).to.equal(0);
  });
});
