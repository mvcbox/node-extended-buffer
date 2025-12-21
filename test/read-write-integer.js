"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Write/Read integer', function () {
  it('writeInt8/readInt8', function() {
    const size = 1;
    const buffer = new ExtendedBuffer();

    buffer.writeInt8(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readInt8()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x1])
    )).to.equal(0);
  });

  it('writeUInt8/readUInt8', function() {
    const size = 1;
    const buffer = new ExtendedBuffer();

    buffer.writeUInt8(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readUInt8()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x1])
    )).to.equal(0);
  });

  it('writeInt16LE/readInt16LE', function() {
    const size = 2;
    const buffer = new ExtendedBuffer();

    buffer.writeInt16LE(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readInt16LE()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x1, 0x0])
    )).to.equal(0);
  });

  it('writeUInt16LE/readUInt16LE', function() {
    const size = 2;
    const buffer = new ExtendedBuffer();

    buffer.writeUInt16LE(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readUInt16LE()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x1, 0x0])
    )).to.equal(0);
  });

  it('writeInt16BE/readInt16BE', function() {
    const size = 2;
    const buffer = new ExtendedBuffer();

    buffer.writeInt16BE(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readInt16BE()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x0, 0x1])
    )).to.equal(0);
  });

  it('writeUInt16BE/readUInt16BE', function() {
    const size = 2;
    const buffer = new ExtendedBuffer();

    buffer.writeUInt16BE(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readUInt16BE()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x0, 0x1])
    )).to.equal(0);
  });

  it('writeInt32LE/readInt32LE', function() {
    const size = 4;
    const buffer = new ExtendedBuffer();

    buffer.writeInt32LE(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readInt32LE()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x1, 0x0, 0x0, 0x0])
    )).to.equal(0);
  });

  it('writeUInt32LE/readUInt32LE', function() {
    const size = 4;
    const buffer = new ExtendedBuffer();

    buffer.writeUInt32LE(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readUInt32LE()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x1, 0x0, 0x0, 0x0])
    )).to.equal(0);
  });

  it('writeInt32BE/readInt32BE', function() {
    const size = 4;
    const buffer = new ExtendedBuffer();

    buffer.writeInt32BE(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readInt32BE()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x0, 0x0, 0x0, 0x1])
    )).to.equal(0);
  });

  it('writeUInt32BE/readUInt32BE', function() {
    const size = 4;
    const buffer = new ExtendedBuffer();

    buffer.writeUInt32BE(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.getReadableSize()).to.equal(size);

    expect(buffer.readUInt32BE()).to.equal(1);
    expect(buffer.length).to.equal(size);
    expect(buffer.pointer).to.equal(size);
    expect(buffer.getReadableSize()).to.equal(0);

    buffer.setPointer(0);

    expect(Buffer.compare(
      buffer.readBuffer(size, true),
      Buffer.from([0x0, 0x0, 0x0, 0x1])
    )).to.equal(0);
  });
});
