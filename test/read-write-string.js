"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('Write/Read string', function () {
  it('writeString/readString', function() {
    const buffer = new ExtendedBuffer();
    const string = 'Hello World';
    const stringBuffer = Buffer.from(string, 'utf8');

    buffer.writeString(string);
    expect(buffer.length).to.equal(stringBuffer.length);
    expect(buffer.getReadableSize()).to.equal(stringBuffer.length);

    expect(Buffer.compare(
      buffer.readBuffer(stringBuffer.length, true),
      stringBuffer
    )).to.equal(0);

    buffer.setPointer(0);
    expect(buffer.readString(stringBuffer.length, 'utf8')).to.equal(string);
    expect(buffer.getReadableSize()).to.equal(0);
  });
});
