"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Create default instance', function () {
  it('Create default instance', function() {
    const buffer = new ExtendedBuffer();
    expect(buffer.length).to.equal(0);
    expect(buffer.capacity).to.equal(16 * 1024);
    expect(buffer.pointer).to.equal(0);
    expect(buffer.nativeBufferView.length).to.equal(0);
  });
});
