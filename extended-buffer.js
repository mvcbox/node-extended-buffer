'use strict';

class ExtendedBuffer
{
    /**
     * 
     */
    constructor () {
        this.pointer = 0;
        this._pointerEnd = 0;
        this._pointerStart = 0;
        this._allocSizeEnd = 8192;
        this._allocSizeStart = 8192;

        if (!arguments.length) {
            this._nativeBuffer = Buffer.from([]);
            return;
        }

        if (arguments[0] instanceof ExtendedBuffer) {
            arguments[0] = arguments[0].buffer;
        }

        this._nativeBuffer = Buffer.from.apply(Buffer, arguments);
    }

    /**
     * @returns {ExtendedBuffer}
     */
    static from() {
        if (arguments[0] instanceof ExtendedBuffer) {
            arguments[0] = arguments[0].buffer;
        }

        return new this(Buffer.from.apply(Buffer, arguments));
    }

    /**
     * @param {Array} list
     * @param {number} totalLength
     * @returns {ExtendedBuffer}
     */
    static concat(list, totalLength) {
        let result = Buffer.alloc(0);
        let listLength = list.length;

        for (let i = 0; i < listLength; ++i) {
            if (list[i] instanceof ExtendedBuffer) {
                result = Buffer.concat([result, list[i].buffer]);
            } else if (list[i] instanceof Buffer) {
                result = Buffer.concat([result, list[i]]);
            } else {
                throw new TypeError('"list" have incorrect value');
            }

            if (undefined !== totalLength && result.length >= totalLength) {
                break;
            }
        }

        return new this(result.slice(0, totalLength));
    }

    /**
     * https://github.com/dcodeIO/bytebuffer.js/blob/f3f310b6786e5d44686d385a2cc60c6720a1069b/src/types/varints/varint32.js
     * @param {number} value Signed 32bit integer
     * @returns {number} Unsigned zigzag encoded 32bit integer
     */
    static zigZagEncode32(value) {
        return (((value |= 0) << 1) ^ (value >> 31)) >>> 0;
    }

    /**
     * https://github.com/dcodeIO/bytebuffer.js/blob/f3f310b6786e5d44686d385a2cc60c6720a1069b/src/types/varints/varint32.js
     * @param {number} value Unsigned zigzag encoded 32bit integer
     * @returns {number} Signed 32bit integer
     */
    static zigZagDecode32(value) {
        return ((value >>> 1) ^ -(value & 1)) | 0;
    }

    /**
     * @returns {number}
     */
    get length() {
        return this._pointerEnd - this._pointerStart;
    }

    /**
     * @returns {number}
     */
    get nativeLength() {
        return this._nativeBuffer.length;
    }

    /**
     * @return {Buffer}
     */
    get buffer() {
        return this._nativeBuffer.slice(this._pointerStart, this._pointerEnd);
    }

    /**
     * @param {number} size
     * @return {ExtendedBuffer}
     */
    setAllocSizeStart(size) {
        size = parseInt(size) || 0;
        this._allocSizeStart = size < 0 ? 0 : size;
        return this;
    }

    /**
     * @param {number} size
     * @return {ExtendedBuffer}
     */
    setAllocSizeEnd(size) {
        size = parseInt(size) || 0;
        this._allocSizeEnd = size < 0 ? 0 : size;
        return this;
    }

    /**
     * @param {number} size
     * @return {ExtendedBuffer}
     */
    setAllocSize(size) {
        return this.setAllocSizeStart(size).setAllocSizeEnd(size);
    }

    /**
     * @return {number}
     */
    getFreeSpaceStart() {
        return this._pointerStart;
    }

    /**
     * @return {number}
     */
    getFreeSpaceEnd() {
        return this._nativeBuffer.length - this._pointerEnd;
    }

    /**
     * @param {number} byteLength
     * @return {ExtendedBuffer}
     */
    allocStart(byteLength) {
        byteLength = byteLength < 0 ? 0 : byteLength;

        if (byteLength > this.getFreeSpaceStart()) {
            let allocSize = byteLength + this._allocSizeStart;
            this._nativeBuffer = Buffer.concat([Buffer.alloc(allocSize), this._nativeBuffer]);
            this._pointerStart += allocSize;
            this._pointerEnd += allocSize;
            return this;
        }

        return this;
    }

    /**
     * @param {number} byteLength
     * @return {ExtendedBuffer}
     */
    allocEnd(byteLength) {
        byteLength = byteLength < 0 ? 0 : byteLength;

        if (byteLength > this.getFreeSpaceEnd()) {
            this._nativeBuffer = Buffer.concat([
                this._nativeBuffer,
                Buffer.alloc(byteLength + this._allocSizeEnd)
            ]);
            return this;
        }

        return this;
    }

    /**
     * @param {Buffer} buffer
     * @param {boolean} unshift
     * @return {ExtendedBuffer}
     * @private
     */
    _writeNativeBuffer(buffer, unshift) {
        if (unshift) {
            this.allocStart(buffer.length);
            this._pointerStart -= buffer.length;
            buffer.copy(this._nativeBuffer, this._pointerStart);
        } else {
            this.allocEnd(buffer.length);
            buffer.copy(this._nativeBuffer, this._pointerEnd);
            this._pointerEnd += buffer.length;
        }

        return this;
    }

    /**
     * Garbage Collector
     * @return {ExtendedBuffer}
     */
    gc() {
        if (this.pointer > 0) {
            this._nativeBuffer = Buffer.from(this._nativeBuffer.slice(this._pointerStart + this.pointer, this._pointerEnd));
            this.pointer = 0;
            this._pointerStart = 0;
            this._pointerEnd = this._nativeBuffer.length;
        }

        return this;
    }

    /**
     * @param {number} pointer
     * @returns {ExtendedBuffer}
     */
    setPointer(pointer) {
        if (pointer >= 0 && pointer <= this.length) {
            this.pointer = pointer;
        } else {
            this.pointer = pointer < 0 ? 0 : this.length;
        }

        return this;
    }

    /**
     * @returns {number}
     */
    getPointer() {
        return this.pointer;
    }

    /**
     * @param {number} offset
     * @returns {ExtendedBuffer}
     */
    offset(offset) {
        return this.setPointer(this.pointer + offset);
    }

    /**
     * @param {number} byteLength
     * @returns {boolean}
     */
    isReadable(byteLength) {
        byteLength = byteLength < 1 ? 1 : byteLength;
        return (this._pointerEnd - this._pointerStart - this.pointer) >= byteLength;
    }

    /**
     * @returns {number}
     */
    getReadableSize() {
        return this._pointerEnd - this.pointer;
    }

    /**
     * @param {string} encoding
     * @param {number} start
     * @param {number} end
     * @returns {string}
     */
    toString(encoding, start, end) {
        start = this._pointerStart + (parseInt(start, 10) || 0);
        start = start < this._pointerStart ? this._pointerStart : start;
        end = this._pointerStart + (parseInt(end, 10) || 0);
        end = end > this._pointerEnd ? this._pointerEnd : end;
        return this._nativeBuffer.toString(encoding, start, end);
    }

    /**
     * @param {ExtendedBuffer|Buffer} value
     * @param {boolean} unshift
     * @returns {ExtendedBuffer}
     */
    writeBuffer(value, unshift) {
        if (value instanceof Buffer) {
            return this._writeNativeBuffer(value, unshift);
        } else if (value instanceof ExtendedBuffer) {
            return this._writeNativeBuffer(value.buffer, unshift);
        } else {
            throw new TypeError('"value" is incorrect buffer');
        }
    }

    /**
     * @param {string} value
     * @param {string} encoding
     * @param {boolean} unshift
     * @returns {ExtendedBuffer}
     */
    writeString(value, encoding, unshift) {
        return this._writeNativeBuffer(Buffer.from(value, encoding), unshift);
    }

    /**
     * @param {number} value
     * @param {number} byteLength
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @returns {ExtendedBuffer}
     */
    writeIntBE(value, byteLength, unshift, noAssert) {
        if (unshift) {
            this.allocStart(byteLength);
            this._pointerStart -= byteLength;
            this._nativeBuffer.writeIntBE(value, this._pointerStart, byteLength, noAssert);
        } else {
            this.allocEnd(byteLength);
            this._nativeBuffer.writeIntBE(value, this._pointerEnd, byteLength, noAssert);
            this._pointerEnd += byteLength;
        }

        return this;
    }

    /**
     * @param {number} value
     * @param {number} byteLength
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @returns {ExtendedBuffer}
     */
    writeIntLE(value, byteLength, unshift, noAssert) {
        if (unshift) {
            this.allocStart(byteLength);
            this._pointerStart -= byteLength;
            this._nativeBuffer.writeIntLE(value, this._pointerStart, byteLength, noAssert);
        } else {
            this.allocEnd(byteLength);
            this._nativeBuffer.writeIntLE(value, this._pointerEnd, byteLength, noAssert);
            this._pointerEnd += byteLength;
        }

        return this;
    }

    /**
     * @param {number} value
     * @param {number} byteLength
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @returns {ExtendedBuffer}
     */
    writeUIntBE(value, byteLength, unshift, noAssert) {
        if (unshift) {
            this.allocStart(byteLength);
            this._pointerStart -= byteLength;
            this._nativeBuffer.writeUIntBE(value, this._pointerStart, byteLength, noAssert);
        } else {
            this.allocEnd(byteLength);
            this._nativeBuffer.writeUIntBE(value, this._pointerEnd, byteLength, noAssert);
            this._pointerEnd += byteLength;
        }

        return this;
    }

    /**
     * @param {number} value
     * @param {number} byteLength
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @returns {ExtendedBuffer}
     */
    writeUIntLE(value, byteLength, unshift, noAssert) {
        if (unshift) {
            this.allocStart(byteLength);
            this._pointerStart -= byteLength;
            this._nativeBuffer.writeUIntLE(value, this._pointerStart, byteLength, noAssert);
        } else {
            this.allocEnd(byteLength);
            this._nativeBuffer.writeUIntLE(value, this._pointerEnd, byteLength, noAssert);
            this._pointerEnd += byteLength;
        }

        return this;
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeInt8(value, unshift, noAssert) {
        return this.writeIntBE(value, 1, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeUInt8(value, unshift, noAssert) {
        return this.writeUIntBE(value, 1, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeInt16BE(value, unshift, noAssert) {
        return this.writeIntBE(value, 2, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeInt16LE(value, unshift, noAssert) {
        return this.writeIntLE(value, 2, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeUInt16BE(value, unshift, noAssert) {
        return this.writeUIntBE(value, 2, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeUInt16LE(value, unshift, noAssert) {
        return this.writeUIntLE(value, 2, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeInt32BE(value, unshift, noAssert) {
        return this.writeIntBE(value, 4, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeInt32LE(value, unshift, noAssert) {
        return this.writeIntLE(value, 4, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeUInt32BE(value, unshift, noAssert) {
        return this.writeUIntBE(value, 4, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeUInt32LE(value, unshift, noAssert) {
        return this.writeUIntLE(value, 4, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeInt64BE(value, unshift, noAssert) {
        return this.writeIntBE(value, 8, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeInt64LE(value, unshift, noAssert) {
        return this.writeIntLE(value, 8, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeUInt64BE(value, unshift, noAssert) {
        return this.writeUIntBE(value, 8, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeUInt64LE(value, unshift, noAssert) {
        return this.writeUIntLE(value, 8, unshift, noAssert);
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeFloatBE(value, unshift, noAssert) {
        if (unshift) {
            this.allocStart(4);
            this._pointerStart -= 4;
            this._nativeBuffer.writeFloatBE(value, this._pointerStart, noAssert);
        } else {
            this.allocEnd(4);
            this._nativeBuffer.writeFloatBE(value, this._pointerEnd, noAssert);
            this._pointerEnd += 4;
        }

        return this;
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeFloatLE(value, unshift, noAssert) {
        if (unshift) {
            this.allocStart(4);
            this._pointerStart -= 4;
            this._nativeBuffer.writeFloatLE(value, this._pointerStart, noAssert);
        } else {
            this.allocEnd(4);
            this._nativeBuffer.writeFloatLE(value, this._pointerEnd, noAssert);
            this._pointerEnd += 4;
        }

        return this;
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeDoubleBE(value, unshift, noAssert) {
        if (unshift) {
            this.allocStart(8);
            this._pointerStart -= 8;
            this._nativeBuffer.writeDoubleBE(value, this._pointerStart, noAssert);
        } else {
            this.allocEnd(8);
            this._nativeBuffer.writeDoubleBE(value, this._pointerEnd, noAssert);
            this._pointerEnd += 8;
        }

        return this;
    }

    /**
     * @param {number} value
     * @param {boolean} unshift
     * @param {boolean} noAssert
     * @return {ExtendedBuffer}
     */
    writeDoubleLE(value, unshift, noAssert) {
        if (unshift) {
            this.allocStart(8);
            this._pointerStart -= 8;
            this._nativeBuffer.writeDoubleLE(value, this._pointerStart, noAssert);
        } else {
            this.allocEnd(8);
            this._nativeBuffer.writeDoubleLE(value, this._pointerEnd, noAssert);
            this._pointerEnd += 8;
        }

        return this;
    }

    /**
     * https://github.com/dcodeIO/bytebuffer.js/blob/f3f310b6786e5d44686d385a2cc60c6720a1069b/src/types/varints/varint32.js
     * @param {number} value
     * @param {boolean} unshift
     * @returns {ExtendedBuffer}
     */
    writeVarInt32(value, unshift) {
        value >>>= 0;
        let b;
        let buffer = (new this.constructor).setAllocSizeEnd(4);

        while (value >= 0x80) {
            b = (value & 0x7f) | 0x80;
            buffer.writeUIntBE(b, 1);
            value >>>= 7;
        }

        buffer.writeUIntBE(value, 1);
        return this._writeNativeBuffer(buffer.buffer, unshift);
    }

    /**
     * @param {number} size
     * @param {boolean} asNative
     * @returns {ExtendedBuffer|Buffer}
     */
    readBuffer(size, asNative) {
        size = size < 0 ? 0 : size;
        let buffer = this._nativeBuffer.slice(this._pointerStart + this.pointer, this._pointerStart + this.pointer + size);
        this.pointer += size;
        return asNative ? Buffer.from(buffer) : new this.constructor(buffer);
    }

    /**
     * @param {number} size
     * @param {string} encoding
     * @returns {string}
     */
    readString(size, encoding) {
        this.pointer += size;
        return this._nativeBuffer.toString(encoding, this._pointerStart + this.pointer - size, this._pointerStart + this.pointer);
    }

    /**
     * @param {number} byteLength
     * @param {boolean} noAssert
     * @returns {number}
     */
    readIntBE(byteLength, noAssert) {
        this.pointer += byteLength;
        return this._nativeBuffer.readIntBE(this._pointerStart + this.pointer - byteLength, byteLength, noAssert);
    }

    /**
     * @param {number} byteLength
     * @param {boolean} noAssert
     * @returns {number}
     */
    readIntLE(byteLength, noAssert) {
        this.pointer += byteLength;
        return this._nativeBuffer.readIntLE(this._pointerStart + this.pointer - byteLength, byteLength, noAssert);
    }

    /**
     * @param {number} byteLength
     * @param {boolean} noAssert
     * @returns {number}
     */
    readUIntBE(byteLength, noAssert) {
        this.pointer += byteLength;
        return this._nativeBuffer.readUIntBE(this._pointerStart + this.pointer - byteLength, byteLength, noAssert);
    }

    /**
     * @param {number} byteLength
     * @param {boolean} noAssert
     * @returns {number}
     */
    readUIntLE(byteLength, noAssert) {
        this.pointer += byteLength;
        return this._nativeBuffer.readUIntLE(this._pointerStart + this.pointer - byteLength, byteLength, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readInt8(noAssert) {
        return this.readIntBE(1, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readUInt8(noAssert) {
        return this.readUIntBE(1, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readInt16BE(noAssert) {
        return this.readIntBE(2, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readInt16LE(noAssert) {
        return this.readIntLE(2, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readUInt16BE(noAssert) {
        return this.readUIntBE(2, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readUInt16LE(noAssert) {
        return this.readUIntLE(2, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readInt32BE(noAssert) {
        return this.readIntBE(4, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readInt32LE(noAssert) {
        return this.readIntLE(4, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readUInt32BE(noAssert) {
        return this.readUIntBE(4, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readUInt32LE(noAssert) {
        return this.readUIntLE(4, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readInt64BE(noAssert) {
        return this.readIntBE(8, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readInt64LE(noAssert) {
        return this.readIntLE(8, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readUInt64BE(noAssert) {
        return this.readUIntBE(8, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readUInt64LE(noAssert) {
        return this.readUIntLE(8, noAssert);
    }

    /**
     * @param  {boolean}noAssert
     * @returns {number}
     */
    readFloatBE(noAssert) {
        this.pointer += 4;
        return this._nativeBuffer.readFloatBE(this._pointerStart + this.pointer - 4, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readFloatLE(noAssert) {
        this.pointer += 4;
        return this._nativeBuffer.readFloatLE(this._pointerStart + this.pointer - 4, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readDoubleBE(noAssert) {
        this.pointer += 8;
        return this._nativeBuffer.readDoubleBE(this._pointerStart + this.pointer - 8, noAssert);
    }

    /**
     * @param {boolean} noAssert
     * @returns {number}
     */
    readDoubleLE(noAssert) {
        this.pointer += 8;
        return this._nativeBuffer.readDoubleLE(this._pointerStart + this.pointer - 8, noAssert);
    }

    /**
     * https://github.com/dcodeIO/bytebuffer.js/blob/f3f310b6786e5d44686d385a2cc60c6720a1069b/src/types/varints/varint32.js
     * @returns {number}
     */
    readVarInt32() {
        let c = 0;
        let value = 0 >>> 0;
        let b;

        do {
            b = this.readUIntBE(1);
            if (c < 5) {
                value |= (b & 0x7f) << (7*c);
            }
            ++c;
        } while ((b & 0x80) !== 0);

        return value | 0;
    }

    /**
     * @return {boolean}
     */
    isReadableVarInt32() {
        let c = 0;
        let value = 0 >>> 0;
        let b;
        let oldPointer = this.pointer;

        do {
            if (!this.isReadable(1)) {
                this.pointer = oldPointer;
                return false;
            }
            b = this.readUIntBE(1);
            if (c < 5) {
                value |= (b & 0x7f) << (7*c);
            }
            ++c;
        } while ((b & 0x80) !== 0);

        this.pointer = oldPointer;
        return true;
    }
}

module.exports = ExtendedBuffer;
