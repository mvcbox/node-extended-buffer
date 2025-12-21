"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Write/Read string [unshift]', function () {
  it('writeString/readString [unshift]', function() {
    const buffer = new ExtendedBuffer();
    buffer.writeString('aaa', 'utf8');
    buffer.writeString('bbb', 'utf8', true);
    expect(buffer.readString(3, 'utf8')).to.equal('bbb');
    expect(buffer.readString(3, 'utf8')).to.equal('aaa');
  });
});
