"use strict";

const expect  = require('chai').expect;
const Buffer  = require('buffer').Buffer;
const ExtendedBuffer = require('..').ExtendedBuffer;
const ExtendedBufferError = require('..').ExtendedBufferError;
const ExtendedBufferTypeError = require('..').ExtendedBufferTypeError;
const ExtendedBufferRangeError = require('..').ExtendedBufferRangeError;

describe('Check invalid input', function () {
  it('Invalid size for writeIntLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeIntLE(1, 0);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for writeIntLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeIntLE(1, 7);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for writeUIntLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeUIntLE(1, 0);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for writeUIntLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeUIntLE(1, 7);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for writeIntBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeIntBE(1, 0);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for writeIntBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeIntBE(1, 7);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for writeUIntBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeUIntBE(1, 0);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for writeUIntBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.writeUIntBE(1, 7);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for readIntLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readIntLE(0);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for readIntLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readIntLE(7);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for readUIntLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readUIntLE(0);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for readUIntLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readUIntLE(7);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for readIntBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readIntBE(0);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for readIntBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readIntBE(7);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for readUIntBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readUIntBE(0);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Invalid size for readUIntBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readUIntBE(7);
    }).to.throw('INVALID_INTEGER_SIZE_VALUE_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readInt8()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readInt8();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readUInt8()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readUInt8();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readInt16LE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readInt16LE();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readInt16BE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readInt16BE();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readUInt16LE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readUInt16LE();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readUInt16BE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readUInt16BE();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readFloatLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readFloatLE();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readFloatBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readFloatBE();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readDoubleLE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readDoubleLE();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readDoubleBE()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readDoubleBE();
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readString()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readString(10, 'utf8');
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Read from empty buffer readBuffer()', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.readBuffer(10);
    }).to.throw('SIZE_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });

  it('Set invalid pointer', function() {
    const buffer = new ExtendedBuffer();

    expect(function() {
      buffer.setPointer(10);
    }).to.throw('POINTER_OUT_OF_RANGE').instanceOf(ExtendedBufferRangeError);
  });
});
