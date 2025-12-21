"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Create default instance', function () {
  const buffer = new ExtendedBuffer();

  it('Check length', function() {
    expect(buffer.length).to.equal(0);
  });

  it('Check capacity', function() {
    expect(buffer.capacity).to.equal(512 * 1024);
  });

  it('Check pointer', function() {
    expect(buffer.pointer).to.equal(0);
  });

  it('Check nativeBufferView length', function() {
    expect(buffer.nativeBufferView.length).to.equal(0);
  });
});
