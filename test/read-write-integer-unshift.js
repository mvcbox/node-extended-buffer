"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Write/Read integer [unshift]', function () {
  it('writeInt8/readInt8 [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeInt8(1);
    buffer.writeInt8(2, true);
    expect(buffer.readInt8()).to.equal(2);
    expect(buffer.readInt8()).to.equal(1);
  });

  it('writeUInt8/readUInt8 [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeUInt8(1);
    buffer.writeUInt8(2, true);
    expect(buffer.readUInt8()).to.equal(2);
    expect(buffer.readUInt8()).to.equal(1);
  });

  it('writeInt16LE/readInt16LE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeInt16LE(1);
    buffer.writeInt16LE(2, true);
    expect(buffer.readInt16LE()).to.equal(2);
    expect(buffer.readInt16LE()).to.equal(1);
  });

  it('writeUInt16LE/readUInt16LE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeUInt16LE(1);
    buffer.writeUInt16LE(2, true);
    expect(buffer.readUInt16LE()).to.equal(2);
    expect(buffer.readUInt16LE()).to.equal(1);
  });

  it('writeInt16BE/readInt16BE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeInt16BE(1);
    buffer.writeInt16BE(2, true);
    expect(buffer.readInt16BE()).to.equal(2);
    expect(buffer.readInt16BE()).to.equal(1);
  });

  it('writeUInt16BE/readUInt16BE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeUInt16BE(1);
    buffer.writeUInt16BE(2, true);
    expect(buffer.readUInt16BE()).to.equal(2);
    expect(buffer.readUInt16BE()).to.equal(1);
  });

  it('writeInt32LE/readInt32LE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeInt32LE(1);
    buffer.writeInt32LE(2, true);
    expect(buffer.readInt32LE()).to.equal(2);
    expect(buffer.readInt32LE()).to.equal(1);
  });

  it('writeUInt32LE/readUInt32LE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeUInt32LE(1);
    buffer.writeUInt32LE(2, true);
    expect(buffer.readUInt32LE()).to.equal(2);
    expect(buffer.readUInt32LE()).to.equal(1);
  });

  it('writeInt32BE/readInt32BE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeInt32BE(1);
    buffer.writeInt32BE(2, true);
    expect(buffer.readInt32BE()).to.equal(2);
    expect(buffer.readInt32BE()).to.equal(1);
  });

  it('writeUInt32BE/readUInt32BE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeUInt32BE(1);
    buffer.writeUInt32BE(2, true);
    expect(buffer.readUInt32BE()).to.equal(2);
    expect(buffer.readUInt32BE()).to.equal(1);
  });
});
