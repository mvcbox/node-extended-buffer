'use strict';

module.exports = class ExtendedBuffer {
    /**
     * @param input
     */
    constructor (input) {
        this.buffer = Buffer.from((input instanceof Buffer) ? input : []);
        this.pointer = 0;
    }

    /**
     * @returns {number}
     */
    get length() {
        return this.buffer.length;
    }

    /**
     * @param buffer
     * @returns {ExtendedBuffer}
     */
    static copy(buffer) {
        if (buffer instanceof ExtendedBuffer && buffer.buffer instanceof Buffer) {
            return new ExtendedBuffer(buffer.buffer);
        } else if (buffer instanceof Buffer) {
            return Buffer.from(buffer);
        } else {
            throw new TypeError('"buffer" is not an instance of a class ExtendedBuffer or Buffer');
        }
    }

    /**
     * @returns {ExtendedBuffer}
     */
    static from() {
        return new ExtendedBuffer(Buffer.from.apply(this, arguments));
    }

    /**
     * @param list
     * @param totalLength
     * @returns {ExtendedBuffer}
     */
    static concat(list, totalLength) {
        let result = Buffer.alloc(0);
        let size = list.length;
        for (let i = 0; i < size; i++) {
            if (list[i] instanceof ExtendedBuffer && list[i].buffer instanceof Buffer) {
                result = Buffer.concat([result, list[i].buffer]);
            } else if (list[i] instanceof Buffer) {
                result = Buffer.concat([result, list[i]]);
            } else {
                throw new TypeError('"list" have incorrect value');
            }
            if (totalLength && result.length >= totalLength) {
                break;
            }
        }
        return new ExtendedBuffer(result.slice(0, totalLength));
    }

    /**
     * @param pointer
     * @returns {ExtendedBuffer}
     */
    setPointer(pointer) {
        this.pointer = parseInt(pointer) || 0;
        this.pointer = this.pointer < 0 ? this.buffer.length + this.pointer : pointer;
        this.pointer = this.pointer < 0 ? 0 : this.pointer;
        return this;
    }

    /**
     * @returns {number}
     */
    getPointer(){
        return this.pointer;
    }

    /**
     * @param offset
     * @returns {ExtendedBuffer}
     */
    offset(offset) {
        this.pointer += parseInt(offset) || 0;
        return this;
    }

    /**
     * @param needBytes
     * @returns {boolean}
     */
    isReadable(needBytes) {
        needBytes = parseInt(needBytes) || 0;
        needBytes = needBytes < 1 ? 1 : needBytes;
        return (this.pointer + needBytes) <= this.buffer.length;
    }

    /**
     * @param encoding
     * @param start
     * @param end
     * @returns {string}
     */
    toString(encoding, start, end) {
        return this.buffer.toString(encoding, start, end);
    }

    /**
     * @param value
     * @returns {ExtendedBuffer}
     */
    writeBuffer(value) {
        if (value instanceof ExtendedBuffer && value.buffer instanceof Buffer) {
            this.buffer = Buffer.concat([this.buffer, value.buffer]);
        } else if (value instanceof Buffer) {
            this.buffer = Buffer.concat([this.buffer, value]);
        } else {
            throw new TypeError('"value" is incorrect buffer');
        }
        return this;
    }

    /**
     * @param value
     * @param encoding
     * @returns {ExtendedBuffer}
     */
    writeString(value, encoding) {
        this.buffer = Buffer.concat([this.buffer, Buffer.from(value, encoding)]);
        return this;
    }

    /**
     * @param value
     * @param byteLength
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeIntBE(value, byteLength, noAssert) {
        let buffer = Buffer.alloc(byteLength);
        buffer.writeIntBE(value, 0, byteLength, noAssert);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        return this;
    };

    /**
     * @param value
     * @param byteLength
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeIntLE(value, byteLength, noAssert) {
        let buffer = Buffer.alloc(byteLength);
        buffer.writeIntLE(value, 0, byteLength, noAssert);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        return this;
    };

    /**
     * @param value
     * @param byteLength
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeUIntBE(value, byteLength, noAssert) {
        let buffer = Buffer.alloc(byteLength);
        buffer.writeUIntBE(value, 0, byteLength, noAssert);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        return this;
    };

    /**
     * @param value
     * @param byteLength
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeUIntLE(value, byteLength, noAssert) {
        let buffer = Buffer.alloc(byteLength);
        buffer.writeUIntLE(value, 0, byteLength, noAssert);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        return this;
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeInt8(value, noAssert) {
        return this.writeIntBE(value, 1, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeUInt8(value, noAssert) {
        return this.writeUIntBE(value, 1, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeInt16BE(value, noAssert) {
        return this.writeIntBE(value, 2, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeInt16LE(value, noAssert) {
        return this.writeIntLE(value, 2, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeUInt16BE(value, noAssert) {
        return this.writeUIntBE(value, 2, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeUInt16LE(value, noAssert) {
        return this.writeUIntLE(value, 2, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeInt32BE(value, noAssert) {
        return this.writeIntBE(value, 4, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeInt32LE(value, noAssert) {
        return this.writeIntLE(value, 4, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeUInt32BE(value, noAssert) {
        return this.writeUIntBE(value, 4, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeUInt32LE(value, noAssert) {
        return this.writeUIntLE(value, 4, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeInt64BE(value, noAssert) {
        return this.writeIntBE(value, 8, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeInt64LE(value, noAssert) {
        return this.writeIntLE(value, 8, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeUInt64BE(value, noAssert) {
        return this.writeUIntBE(value, 8, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeUInt64LE(value, noAssert) {
        return this.writeUIntLE(value, 8, noAssert);
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeFloatBE(value, noAssert) {
        let buffer = Buffer.alloc(4);
        buffer.writeFloatBE(value, 0, noAssert);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        return this;
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeFloatLE(value, noAssert) {
        let buffer = Buffer.alloc(4);
        buffer.writeFloatLE(value, 0, noAssert);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        return this;
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeDoubleBE(value, noAssert) {
        let buffer = Buffer.alloc(8);
        buffer.writeDoubleBE(value, 0, noAssert);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        return this;
    };

    /**
     * @param value
     * @param noAssert
     * @returns {ExtendedBuffer}
     */
    writeDoubleLE(value, noAssert) {
        let buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(value, 0, noAssert);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        return this;
    };

    /**
     * @param size
     * @param asNative
     * @returns {ExtendedBuffer|Buffer}
     */
    readBuffer(size, asNative) {
        this.pointer += size;
        if (asNative) {
            return Buffer.from(this.buffer.slice(this.pointer - size, this.pointer));
        }
        return new ExtendedBuffer(this.buffer.slice(this.pointer - size, this.pointer));
    };

    /**
     * @param size
     * @param encoding
     * @returns {string}
     */
    readString(size, encoding) {
        this.pointer += size;
        return this.buffer.toString(encoding, this.pointer - size, this.pointer);
    };

    /**
     * @param byteLength
     * @param noAssert
     * @returns {number}
     */
    readIntBE(byteLength, noAssert) {
        this.pointer += byteLength;
        return this.buffer.readIntBE(this.pointer - byteLength, byteLength, noAssert);
    };

    /**
     * @param byteLength
     * @param noAssert
     * @returns {number}
     */
    readIntLE(byteLength, noAssert) {
        this.pointer += byteLength;
        return this.buffer.readIntLE(this.pointer - byteLength, byteLength, noAssert);
    };

    /**
     * @param byteLength
     * @param noAssert
     * @returns {number}
     */
    readUIntBE(byteLength, noAssert) {
        this.pointer += byteLength;
        return this.buffer.readUIntBE(this.pointer - byteLength, byteLength, noAssert);
    };

    /**
     * @param byteLength
     * @param noAssert
     * @returns {number}
     */
    readUIntLE(byteLength, noAssert) {
        this.pointer += byteLength;
        return this.buffer.readUIntLE(this.pointer - byteLength, byteLength, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readInt8(noAssert) {
        return this.readIntBE(1, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readUInt8(noAssert) {
        return this.readUIntBE(1, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readInt16BE(noAssert) {
        return this.readIntBE(2, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readInt16LE(noAssert) {
        return this.readIntLE(2, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readUInt16BE(noAssert) {
        return this.readUIntBE(2, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readUInt16LE(noAssert) {
        return this.readUIntLE(2, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readInt32BE(noAssert) {
        return this.readIntBE(4, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readInt32LE(noAssert) {
        return this.readIntLE(4, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readUInt32BE(noAssert) {
        return this.readUIntBE(4, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readUInt32LE(noAssert) {
        return this.readUIntLE(4, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readInt64BE(noAssert) {
        return this.readIntBE(8, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readInt64LE(noAssert) {
        return this.readIntLE(8, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readUInt64BE(noAssert) {
        return this.readUIntBE(8, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readUInt64LE(noAssert) {
        return this.readUIntLE(8, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readFloatBE(noAssert) {
        this.pointer += 4;
        return this.buffer.readFloatBE(this.pointer - 4, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readFloatLE(noAssert) {
        this.pointer += 4;
        return this.buffer.readFloatLE(this.pointer - 4, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readDoubleBE(noAssert) {
        this.pointer += 8;
        return this.buffer.readDoubleBE(this.pointer - 8, noAssert);
    };

    /**
     * @param noAssert
     * @returns {number}
     */
    readDoubleLE(noAssert) {
        this.pointer += 8;
        return this.buffer.readDoubleLE(this.pointer - 8, noAssert);
    };
};
