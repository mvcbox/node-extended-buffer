'use strict';

module.exports = ExtendedBuffer;

/**
 * @param input
 * @constructor
 */
function ExtendedBuffer(input) {
    if (input instanceof Buffer) {
        this.buffer = input;
    }
}

/**
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.from = function () {
    return new ExtendedBuffer(Buffer.from.apply(this, arguments));
};

/**
 * @param list
 * @param totalLength
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.concat = function (list, totalLength) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] instanceof ExtendedBuffer) {
            list[i] = list[i].buffer;
        }
    }
    return new ExtendedBuffer(Buffer.concat(list, totalLength));
};

/**
 * @type {Buffer}
 */
ExtendedBuffer.prototype.buffer = new Buffer(0);

/**
 * @type {number}
 */
ExtendedBuffer.prototype.pointer = 0;

/**
 *
 */
Object.defineProperty(ExtendedBuffer.prototype, 'length', {
    get: function () {
        return this.buffer.length;
    }
});

/**
 * @param pointer
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.setPointer = function (pointer) {
    this.pointer = parseInt(pointer) || 0;
    this.pointer = this.pointer < 0 ? this.buffer.length + this.pointer : pointer;
    this.pointer = this.pointer < 0 ? 0 : this.pointer;
    return this;
};

/**
 * @returns {number}
 */
ExtendedBuffer.prototype.getPointer = function () {
    return this.pointer;
};

/**
 * @param offset
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.offset = function (offset) {
    this.pointer += parseInt(offset || 0);
    return this;
};

/**
 * @param needBytes
 * @returns {boolean}
 */
ExtendedBuffer.prototype.isReadable = function (needBytes) {
    needBytes = parseInt(needBytes) || 0;
    needBytes = needBytes < 1 ? 1 : needBytes;
    return (this.pointer + needBytes) <= this.buffer.length;
};

/**
 * @param value
 * @param offset
 * @returns {*}
 */
ExtendedBuffer.prototype.updatePointerAndReturnValue = function (value, offset) {
    this.pointer += offset;
    return value;
};

/**
 * @param value
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeBuffer = function (value) {
    if (value instanceof ExtendedBuffer) {
        value = value.buffer;
    }
    if (! (value instanceof Buffer)) {
        throw new TypeError('Incorrect buffer');
    }
    this.buffer = Buffer.concat([this.buffer, value]);
    return this;
};

/**
 * @param value
 * @param encoding
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeString = function (value, encoding) {
    return this.writeBuffer(Buffer.from(value, encoding));
};

/**
 * @param value
 * @param byteLength
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeIntBE = function (value, byteLength, noAssert) {
    var buffer = new Buffer(byteLength);
    buffer.writeIntBE(value, 0, byteLength, noAssert);
    return this.writeBuffer(buffer);
};

/**
 * @param value
 * @param byteLength
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeIntLE = function (value, byteLength, noAssert) {
    var buffer = new Buffer(byteLength);
    buffer.writeIntLE(value, 0, byteLength, noAssert);
    return this.writeBuffer(buffer);
};

/**
 * @param value
 * @param byteLength
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeUIntBE = function (value, byteLength, noAssert) {
    var buffer = new Buffer(byteLength);
    buffer.writeUIntBE(value, 0, byteLength, noAssert);
    return this.writeBuffer(buffer);
};

/**
 * @param value
 * @param byteLength
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeUIntLE = function (value, byteLength, noAssert) {
    var buffer = new Buffer(byteLength);
    buffer.writeUIntLE(value, 0, byteLength, noAssert);
    return this.writeBuffer(buffer);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeInt8 = function (value, noAssert) {
    return this.writeIntBE(value, 1, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeUInt8 = function (value, noAssert) {
    return this.writeUIntBE(value, 1, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeInt16BE = function (value, noAssert) {
    return this.writeIntBE(value, 2, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeInt16LE = function (value, noAssert) {
    return this.writeIntLE(value, 2, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeUInt16BE = function (value, noAssert) {
    return this.writeUIntBE(value, 2, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeUInt16LE = function (value, noAssert) {
    return this.writeUIntLE(value, 2, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeInt32BE = function (value, noAssert) {
    return this.writeIntBE(value, 4, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeInt32LE = function (value, noAssert) {
    return this.writeIntLE(value, 4, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeUInt32BE = function (value, noAssert) {
    return this.writeUIntBE(value, 4, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeUInt32LE = function (value, noAssert) {
    return this.writeUIntLE(value, 4, noAssert);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeFloatBE = function (value, noAssert) {
    var buffer = new Buffer(4);
    buffer.writeFloatBE(value, 0, noAssert);
    return this.writeBuffer(buffer);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeFloatLE = function (value, noAssert) {
    var buffer = new Buffer(4);
    buffer.writeFloatLE(value, 0, noAssert);
    return this.writeBuffer(buffer);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeDoubleBE = function (value, noAssert) {
    var buffer = new Buffer(8);
    buffer.writeDoubleBE(value, 0, noAssert);
    return this.writeBuffer(buffer);
};

/**
 * @param value
 * @param noAssert
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeDoubleLE = function (value, noAssert) {
    var buffer = new Buffer(8);
    buffer.writeDoubleLE(value, 0, noAssert);
    return this.writeBuffer(buffer);
};

/**
 * @param value
 * @returns {ExtendedBuffer}
 */
ExtendedBuffer.prototype.writeCUInt = function (value) {
    value = parseInt(value) || 0;
    if (value < 0 || value > 0xfffffff) {
        throw new RangeError('"value" out of range [0 ... 268435455]');
    }
    var resultBufefr = new ExtendedBuffer();
    var buffer = value & 0x7F;
    while (value >>= 7) {
        buffer <<= 8;
        buffer |= ((value & 0x7F) | 0x80);
    }
    while (true) {
        resultBufefr.writeUInt8(buffer, true);
        if (buffer & 0x80) {
            buffer >>= 8;
        } else {
            break;
        }
    }
    this.writeBuffer(resultBufefr);
    return this;
};

/**
 * @param size
 * @returns {Buffer}
 */
ExtendedBuffer.prototype.readBuffer = function (size) {
    this.pointer += size;
    return this.buffer.slice(this.pointer - size, this.pointer);
};

/**
 * @param size
 * @param encoding
 * @returns {string}
 */
ExtendedBuffer.prototype.readString = function (size, encoding) {
    this.pointer += size;
    return this.buffer.toString(encoding, this.pointer - size, this.pointer);
};

/**
 * @param byteLength
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readIntBE = function (byteLength, noAssert) {
    var value = this.buffer.readIntBE(this.pointer, byteLength, noAssert);
    this.pointer += byteLength;
    return value;
};

/**
 * @param byteLength
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readIntLE = function (byteLength, noAssert) {
    var value = this.buffer.readIntLE(this.pointer, byteLength, noAssert);
    this.pointer += byteLength;
    return value;
};

/**
 * @param byteLength
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readUIntBE = function (byteLength, noAssert) {
    var value = this.buffer.readUIntBE(this.pointer, byteLength, noAssert);
    this.pointer += byteLength;
    return value;
};

/**
 * @param byteLength
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readUIntLE = function (byteLength, noAssert) {
    var value = this.buffer.readUIntLE(this.pointer, byteLength, noAssert);
    this.pointer += byteLength;
    return value;
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readInt8 = function (noAssert) {
    return this.readIntBE(1, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readUInt8 = function (noAssert) {
    return this.readUIntBE(1, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readInt16BE = function (noAssert) {
    return this.readIntBE(2, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readInt16LE = function (noAssert) {
    return this.readIntLE(2, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readUInt16BE = function (noAssert) {
    return this.readUIntBE(2, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readUInt16LE = function (noAssert) {
    return this.readUIntLE(2, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readInt32BE = function (noAssert) {
    return this.readIntBE(4, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readInt32LE = function (noAssert) {
    return this.readIntLE(4, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readUInt32BE = function (noAssert) {
    return this.readUIntBE(4, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readUInt32LE = function (noAssert) {
    return this.readUIntLE(4, noAssert);
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readFloatBE = function (noAssert) {
    var value = this.buffer.readFloatBE(this.pointer, noAssert);
    this.pointer += 4;
    return value;
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readFloatLE = function (noAssert) {
    var value = this.buffer.readFloatLE(this.pointer, noAssert);
    this.pointer += 4;
    return value;
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readDoubleBE = function (noAssert) {
    var value = this.buffer.readDoubleBE(this.pointer, noAssert);
    this.pointer += 8;
    return value;
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readDoubleLE = function (noAssert) {
    var value = this.buffer.readDoubleLE(this.pointer, noAssert);
    this.pointer += 8;
    return value;
};

/**
 * @param noAssert
 * @returns {number}
 */
ExtendedBuffer.prototype.readCUInt = function (noAssert) {
    var counter = 0;
    var value, c;
    if ((value = this.readUInt8(noAssert)) & 0x80) {
        value &= 0x7F;
        do {
            counter++;
            if (counter > 10) {
                throw new TypeError('Unable to get the value of CUInt');
            }
            value = (value << 7) + ((c = this.readUInt8(noAssert)) & 0x7F);
        } while (c & 0x80);
    }
    return value;
};
