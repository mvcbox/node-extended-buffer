"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Check invalid input', function () {
  it('buffer.writeIntLE(1, 0)', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeIntLE(1, 0);
    }).to.throw('INVALID_INTEGER_SIZE');
  });

  it('buffer.writeIntLE(1, 7)', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeIntLE(1, 7);
    }).to.throw('INVALID_INTEGER_SIZE');
  });
});
