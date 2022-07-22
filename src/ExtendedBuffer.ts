import { Buffer, kMaxLength } from 'buffer';
import { ExtendedBufferOptions } from  './ExtendedBufferOptions';

export class ExtendedBuffer {
  public _pointer: number;
  public _pointerEnd: number;
  public _pointerStart: number;
  public _nativeBuffer: Buffer;
  public _maxBufferLength: number;

  public constructor(options?: ExtendedBufferOptions) {
    this._maxBufferLength = options?.maxBufferLength ?? (1024 * 1024);
    this._initEmptyBuffer();
  }

  public static get maxSize(): number {
    return kMaxLength;
  }

  public static concat<T extends ExtendedBuffer>(this: new(options?: ExtendedBufferOptions) => T, list: ExtendedBuffer[], totalLength?: number): T {
    let buffer = new this;
    let listLength = list.length;

    for (let i = 0; i < listLength; ++i) {
      buffer.writeBuffer(list[i], false);

      if (undefined !== totalLength && buffer.length >= totalLength) {
        buffer._pointerEnd = buffer._pointerStart + totalLength;
        break;
      }
    }

    return buffer;
  }

  public static zigZagEncode32(value: number): number {
    return (((value |= 0) << 1) ^ (value >> 31)) >>> 0;
  }

  public static zigZagDecode32(value: number): number {
    return ((value >>> 1) ^ -(value & 1)) | 0;
  }

  public get length(): number {
    return this._pointerEnd - this._pointerStart;
  }

  public get nativeLength(): number {
    return this._nativeBuffer.length;
  }

  public get buffer(): Buffer {
    return this._nativeBuffer.slice(this._pointerStart, this._pointerEnd);
  }

  public _initEmptyBuffer(): this {
    if (this._maxBufferLength > kMaxLength) {
      throw new RangeError(`"_maxBufferLength" cannot be more than ${kMaxLength} bytes`);
    }

    this._pointerStart = this._pointerEnd = Math.floor(this._maxBufferLength / 2);
    this._nativeBuffer = Buffer.allocUnsafe ? Buffer.allocUnsafe(this._maxBufferLength) : new Buffer(this._maxBufferLength);
    this._pointer = 0;
    return this;
  }

  public clean(): this {
    return this._initEmptyBuffer();
  }

  public getFreeSpaceStart(): number {
    return this._pointerStart;
  }

  public getFreeSpaceEnd(): number {
    return this._nativeBuffer.length - this._pointerEnd;
  }

  public getFreeSpace(): number {
    return this.getFreeSpaceStart() + this.getFreeSpaceEnd();
  }

  public allocStart(byteLength: number): this {
    if (byteLength > this.getFreeSpaceStart()) {
      if (byteLength > this.getFreeSpace()) {
        throw new RangeError('Not enough free space');
      }

      const offset = Math.floor((this.getFreeSpace() - byteLength) / 2) + byteLength - this._pointerStart;
      this._nativeBuffer.copy(this._nativeBuffer, this._pointerStart + offset, this._pointerStart, this._pointerEnd);
      this._pointerStart += offset;
      this._pointerEnd += offset;
    }

    return this;
  }

  public allocEnd(byteLength: number): this {
    if (byteLength > this.getFreeSpaceEnd()) {
      if (byteLength > this.getFreeSpace()) {
        throw new RangeError('Not enough free space');
      }

      let offset = this._nativeBuffer.length - Math.floor((this.getFreeSpace() - byteLength) / 2) - byteLength - this._pointerEnd;
      this._nativeBuffer.copy(this._nativeBuffer, this._pointerStart + offset, this._pointerStart, this._pointerEnd);
      this._pointerStart += offset;
      this._pointerEnd += offset;
    }

    return this;
  }

  public getReadableSize(): number {
    return this._pointerEnd - this._pointerStart - this._pointer;
  }

  public getWritableSize(): number {
    return this.getFreeSpace();
  }

  public _writeNativeBuffer(buffer: Buffer, unshift?: boolean): this {
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

  public gc(): this {
    if (this._pointer > 0) {
      let payload = this._nativeBuffer.slice(this._pointerStart + this._pointer, this._pointerEnd);
      return this._initEmptyBuffer()._writeNativeBuffer(payload, false);
    }

    return this;
  }

  public nodeGc(): this {
    global.gc && global.gc();
    return this;
  }

  public setPointer(pointer: number): this {
    if (pointer < 0 || pointer > this.length) {
      throw new RangeError('Pointer out of range');
    }

    this._pointer = pointer;
    return this;
  }

  public getPointer(): number {
    return this._pointer;
  }

  public offset(offset: number): this {
    return this.setPointer(this._pointer + offset);
  }

  public isReadable(byteLength: number): boolean {
    byteLength = byteLength < 0 ? 0 : byteLength;
    return this.getReadableSize() >= byteLength;
  }

  public isWritable(byteLength: number = 1): boolean {
    byteLength = byteLength < 1 ? 1 : byteLength;
    return this.getFreeSpace() >= byteLength;
  }

  public toString(encoding?: string, start?: number, end?: number): string {
    return this.buffer.toString(encoding, start, end);
  }

  public writeBuffer(value: Buffer | ExtendedBuffer, unshift?: boolean): this {
    if (value instanceof Buffer) {
      return this._writeNativeBuffer(value, unshift);
    }

    if (value instanceof ExtendedBuffer) {
      return this._writeNativeBuffer(value.buffer, unshift);
    }

    throw new TypeError('"value" is incorrect buffer');
  }

  public writeString(string: string, encoding?: string, unshift?: boolean): this {
    let byteLength = Buffer.byteLength(string, encoding);

    if (unshift) {
      this.allocStart(byteLength);
      this._pointerStart -= byteLength;
      this._nativeBuffer.write(string, this._pointerStart, byteLength, encoding);
    } else {
      this.allocEnd(byteLength);
      this._nativeBuffer.write(string, this._pointerEnd, byteLength, encoding);
      this._pointerEnd += byteLength;
    }

    return this;
  }

  public writeIntBE(value: number, byteLength: number, unshift?: boolean, noAssert?: boolean): this {
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

  public writeIntLE(value: number, byteLength: number, unshift?: boolean, noAssert?: boolean): this {
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

  public writeUIntBE(value: number, byteLength: number, unshift?: boolean, noAssert?: boolean): this {
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

  public writeUIntLE(value: number, byteLength: number, unshift?: boolean, noAssert?: boolean): this {
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

  public writeInt8(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeIntBE(value, 1, unshift, noAssert);
  }

  public writeUInt8(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeUIntBE(value, 1, unshift, noAssert);
  }

  public writeInt16BE(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeIntBE(value, 2, unshift, noAssert);
  }

  public writeInt16LE(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeIntLE(value, 2, unshift, noAssert);
  }

  public writeUInt16BE(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeUIntBE(value, 2, unshift, noAssert);
  }

  public writeUInt16LE(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeUIntLE(value, 2, unshift, noAssert);
  }

  public writeInt32BE(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeIntBE(value, 4, unshift, noAssert);
  }

  public writeInt32LE(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeIntLE(value, 4, unshift, noAssert);
  }

  public writeUInt32BE(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeUIntBE(value, 4, unshift, noAssert);
  }

  public writeUInt32LE(value: number, unshift?: boolean, noAssert?: boolean): this {
    return this.writeUIntLE(value, 4, unshift, noAssert);
  }

  public writeFloatBE(value: number, unshift?: boolean, noAssert?: boolean): this {
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

  public writeFloatLE(value: number, unshift?: boolean, noAssert?: boolean): this {
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

  public writeDoubleBE(value: number, unshift?: boolean, noAssert?: boolean): this {
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

  public writeDoubleLE(value: number, unshift?: boolean, noAssert?: boolean): this {
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
   */
  public writeVarInt32(value: number, unshift?: boolean): this {
    value >>>= 0;
    let b;

    if (unshift) {
      let buffer = new ExtendedBuffer({
        maxBufferLength: 10
      });

      while (value >= 0x80) {
        b = (value & 0x7f) | 0x80;
        buffer.writeUIntBE(b, 1);
        value >>>= 7;
      }

      buffer.writeUIntBE(value, 1);
      return this._writeNativeBuffer(buffer.buffer, true);
    }

    while (value >= 0x80) {
      b = (value & 0x7f) | 0x80;
      this.writeUIntBE(b, 1);
      value >>>= 7;
    }

    return this.writeUIntBE(value, 1);
  }

  public readBuffer(size: number): this;
  public readBuffer(size: number, asNative: false, bufferOptions?: ExtendedBufferOptions): this;
  public readBuffer(size: number, asNative: true, bufferOptions?: ExtendedBufferOptions): Buffer;
  public readBuffer(size: number, asNative?: boolean, bufferOptions?: ExtendedBufferOptions): this | Buffer;
  public readBuffer(size: number, asNative?: boolean, bufferOptions?: ExtendedBufferOptions): this | Buffer {
    let buffer = this._nativeBuffer.slice(this._pointerStart + this._pointer, this._pointerStart + this._pointer + size);
    this._pointer += size;
    const ThisClass = <new(options?: ExtendedBufferOptions) => this>this.constructor;

    if (asNative) {
      return Buffer.from ? Buffer.from(buffer) : new Buffer(buffer);
    }

    return (new ThisClass(bufferOptions))._writeNativeBuffer(buffer, false);
  }

  public readString(size: number, encoding?: string): string {
    this._pointer += size;
    return this._nativeBuffer.toString(encoding, this._pointerStart + this._pointer - size, this._pointerStart + this._pointer);
  }

  public readIntBE(byteLength: number, noAssert?: boolean): number {
    this._pointer += byteLength;
    return this._nativeBuffer.readIntBE(this._pointerStart + this._pointer - byteLength, byteLength, noAssert);
  }

  public readIntLE(byteLength: number, noAssert?: boolean): number {
    this._pointer += byteLength;
    return this._nativeBuffer.readIntLE(this._pointerStart + this._pointer - byteLength, byteLength, noAssert);
  }

  public readUIntBE(byteLength: number, noAssert?: boolean): number {
    this._pointer += byteLength;
    return this._nativeBuffer.readUIntBE(this._pointerStart + this._pointer - byteLength, byteLength, noAssert);
  }

  public readUIntLE(byteLength: number, noAssert?: boolean): number {
    this._pointer += byteLength;
    return this._nativeBuffer.readUIntLE(this._pointerStart + this._pointer - byteLength, byteLength, noAssert);
  }

  public readInt8(noAssert?: boolean): number {
    return this.readIntBE(1, noAssert);
  }

  public readUInt8(noAssert?: boolean): number {
    return this.readUIntBE(1, noAssert);
  }

  public readInt16BE(noAssert?: boolean): number {
    return this.readIntBE(2, noAssert);
  }

  public readInt16LE(noAssert?: boolean): number {
    return this.readIntLE(2, noAssert);
  }

  public readUInt16BE(noAssert?: boolean): number {
    return this.readUIntBE(2, noAssert);
  }

  public readUInt16LE(noAssert?: boolean): number {
    return this.readUIntLE(2, noAssert);
  }

  public readInt32BE(noAssert?: boolean): number {
    return this.readIntBE(4, noAssert);
  }

  public readInt32LE(noAssert?: boolean): number {
    return this.readIntLE(4, noAssert);
  }

  public readUInt32BE(noAssert?: boolean): number {
    return this.readUIntBE(4, noAssert);
  }

  public readUInt32LE(noAssert?: boolean): number {
    return this.readUIntLE(4, noAssert);
  }

  public readFloatBE(noAssert?: boolean): number {
    this._pointer += 4;
    return this._nativeBuffer.readFloatBE(this._pointerStart + this._pointer - 4, noAssert);
  }

  public readFloatLE(noAssert?: boolean): number {
    this._pointer += 4;
    return this._nativeBuffer.readFloatLE(this._pointerStart + this._pointer - 4, noAssert);
  }

  public readDoubleBE(noAssert?: boolean): number {
    this._pointer += 8;
    return this._nativeBuffer.readDoubleBE(this._pointerStart + this._pointer - 8, noAssert);
  }

  public readDoubleLE(noAssert?: boolean): number {
    this._pointer += 8;
    return this._nativeBuffer.readDoubleLE(this._pointerStart + this._pointer - 8, noAssert);
  }

  /**
   * https://github.com/dcodeIO/bytebuffer.js/blob/f3f310b6786e5d44686d385a2cc60c6720a1069b/src/types/varints/varint32.js
   */
  public readVarInt32(): number {
    let c = 0;
    let value = 0 >>> 0;
    let b;

    do {
      b = this.readUIntBE(1);

      if (c < 5) {
        value |= (b & 0x7f) << (7 * c);
      }

      ++c;
    } while ((b & 0x80) !== 0);

    return value | 0;
  }

  public isReadableVarInt32(): boolean {
    let c = 0;
    let value = 0 >>> 0;
    let b;
    let oldPointer = this._pointer;

    do {
      if (!this.isReadable(1)) {
        this._pointer = oldPointer;
        return false;
      }

      b = this.readUIntBE(1);

      if (c < 5) {
        value |= (b & 0x7f) << (7 * c);
      }

      ++c;
    } while ((b & 0x80) !== 0);

    this._pointer = oldPointer;
    return true;
  }
}
