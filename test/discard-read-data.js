"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Discard read data', function () {
  it('Discard read data', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeUInt8(123);

    expect(buffer.length).to.equal(1);

    buffer.readUInt8();
    buffer.discardReadData();

    expect(buffer.length).to.equal(0);
  });
});
