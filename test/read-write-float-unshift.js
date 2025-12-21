"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Write/Read float [unshift]', function () {
  it('writeFloatLE/readFloatLE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeFloatLE(1.0);
    buffer.writeFloatLE(2.0, true);
    expect(buffer.readFloatLE()).to.equal(2.0);
    expect(buffer.readFloatLE()).to.equal(1.0);
  });

  it('writeFloatBE/readFloatBE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeFloatBE(1.0);
    buffer.writeFloatBE(2.0, true);
    expect(buffer.readFloatBE()).to.equal(2.0);
    expect(buffer.readFloatBE()).to.equal(1.0);
  });

  it('writeDoubleLE/readDoubleLE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeDoubleLE(1.0);
    buffer.writeDoubleLE(2.0, true);
    expect(buffer.readDoubleLE()).to.equal(2.0);
    expect(buffer.readDoubleLE()).to.equal(1.0);
  });

  it('writeDoubleBE/readDoubleBE [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeDoubleBE(1.0);
    buffer.writeDoubleBE(2.0, true);
    expect(buffer.readDoubleBE()).to.equal(2.0);
    expect(buffer.readDoubleBE()).to.equal(1.0);
  });
});
