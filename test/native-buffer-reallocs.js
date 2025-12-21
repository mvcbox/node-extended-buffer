"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Native buffer reallocs', function () {
  it('Test #1', function() {
    const buffer = new ExtendedBuffer({
      capacity: 0,
      capacityStep: 0
    });

    buffer.writeUInt8(11);
    buffer.writeUInt8(22);
    buffer.writeUInt8(33, true);
    expect(buffer.readUInt8()).to.equal(33);
    expect(buffer.readUInt8()).to.equal(11);
    expect(buffer.readUInt8()).to.equal(22);
    expect(buffer.length).to.equal(3);
    expect(buffer.capacity).to.equal(3);
  });

  it('Test #2', function() {
    const buffer = new ExtendedBuffer({
      capacity: 1,
      capacityStep: 1
    });

    buffer.writeUInt8(11);
    buffer.writeUInt8(22);
    buffer.writeUInt8(33, true);
    buffer.writeUInt8(44, true);
    expect(buffer.readUInt8()).to.equal(44);
    expect(buffer.readUInt8()).to.equal(33);
    expect(buffer.readUInt8()).to.equal(11);
    expect(buffer.readUInt8()).to.equal(22);
    expect(buffer.length).to.equal(4);
    expect(buffer.capacity).to.equal(5);
  });
});
