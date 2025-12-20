import { Buffer, kMaxLength } from 'buffer';
import { ExtendedBufferOptions } from  './ExtendedBufferOptions';

const defaultNativeBufferSize: number = 1024 * 1024;

export class ExtendedBuffer {
  public _pointer!: number;
  public _pointerEnd!: number;
  public _pointerStart!: number;
  public _nativeBuffer!: Buffer;
  public readonly _nativeBufferLength: number;

  public constructor(options?: ExtendedBufferOptions) {
    this._nativeBufferLength = options?.nativeBufferLength ?? defaultNativeBufferSize;
    this.initExtendedBuffer();
  }

  public static get maxNativeBufferLength(): number {
    return kMaxLength;
  }

  public get length(): number {
    return this._pointerEnd - this._pointerStart;
  }

  public get capacity(): number {
    return this._nativeBuffer.length;
  }

  public get nativeBuffer(): Buffer {
    return this._nativeBuffer.slice(this._pointerStart, this._pointerEnd);
  }

  public initExtendedBuffer(): this {
    if (this._nativeBufferLength < 1) {
      throw new RangeError(`"_nativeBufferLength" cannot be less than 1 byte`);
    }

    if (this._nativeBufferLength > kMaxLength) {
      throw new RangeError(`"_nativeBufferLength" cannot be more than ${kMaxLength} bytes`);
    }

    this._pointer = 0;
    this._pointerStart = this._pointerEnd = Math.floor(this._nativeBufferLength / 2);
    this._nativeBuffer = (typeof Buffer.allocUnsafe === 'function') ? Buffer.allocUnsafe(this._nativeBufferLength) : new Buffer(this._nativeBufferLength);
    return this;
  }

  public clean(): this {
    return this.initExtendedBuffer();
  }

  public getWritableSizeStart(): number {
    return this._pointerStart;
  }

  public getWritableSizeEnd(): number {
    return this._nativeBuffer.length - this._pointerEnd;
  }

  public getWritableSize(): number {
    return this.getWritableSizeStart() + this.getWritableSizeEnd();
  }

  public allocStart(byteLength: number): this {
    if (this.getWritableSizeStart() >= byteLength) {
      return this;
    }

    if (this.getWritableSize() < byteLength) {
      throw new RangeError('Not enough free space');
    }

    const offset = Math.floor((this.getWritableSize() - byteLength) / 2) + byteLength - this._pointerStart;
    this._nativeBuffer.copy(this._nativeBuffer, this._pointerStart + offset, this._pointerStart, this._pointerEnd);
    this._pointerStart += offset;
    this._pointerEnd += offset;
    return this;
  }

  public allocEnd(byteLength: number): this {
    if (this.getWritableSizeEnd() >= byteLength) {
      return this;
    }

    if (this.getWritableSize() < byteLength) {
      throw new RangeError('Not enough free space');
    }

    const offset = this._nativeBuffer.length - Math.floor((this.getWritableSize() - byteLength) / 2) - byteLength - this._pointerEnd;
    this._nativeBuffer.copy(this._nativeBuffer, this._pointerStart + offset, this._pointerStart, this._pointerEnd);
    this._pointerStart += offset;
    this._pointerEnd += offset;
    return this;
  }

  public getReadableSize(): number {
    return this._pointerEnd - this._pointerStart - this._pointer;
  }

  public writeNativeBuffer(buffer: Buffer, unshift?: boolean): this {
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
      const payload = this._nativeBuffer.slice(this._pointerStart + this._pointer, this._pointerEnd);
      return this.initExtendedBuffer().writeNativeBuffer(payload, false);
    }

    return this;
  }

  public nodeGc(): this {
    if (typeof global.gc === 'function') {
      global.gc();
    }

    return this;
  }

  public setPointer(pointer: number): this {
    if (pointer < 0 || pointer > this.length) {
      throw new RangeError('"pointer" out of range');
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
    if (byteLength < 0) {
      throw new RangeError('"byteLength" out of range');
    }

    return this.getReadableSize() >= byteLength;
  }

  public isWritable(byteLength: number = 1): boolean {
    if (byteLength < 0) {
      throw new RangeError('"byteLength" out of range');
    }

    return this.getWritableSize() >= byteLength;
  }

  public writeBuffer(value: Buffer | ExtendedBuffer, unshift?: boolean): this {
    if (value instanceof Buffer) {
      return this.writeNativeBuffer(value, unshift);
    }

    if (value instanceof ExtendedBuffer) {
      return this.writeNativeBuffer(value.nativeBuffer, unshift);
    }

    throw new TypeError('"value" has an invalid type');
  }

  public writeString(string: string, encoding?: string, unshift?: boolean): this {
    const byteLength = Buffer.byteLength(string, encoding);

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

  public writeIntBE(value: number, byteLength: number, unshift?: boolean): this {
    if (unshift) {
      this.allocStart(byteLength);
      this._pointerStart -= byteLength;
      this._nativeBuffer.writeIntBE(value, this._pointerStart, byteLength);
    } else {
      this.allocEnd(byteLength);
      this._nativeBuffer.writeIntBE(value, this._pointerEnd, byteLength);
      this._pointerEnd += byteLength;
    }

    return this;
  }

  public writeIntLE(value: number, byteLength: number, unshift?: boolean): this {
    if (unshift) {
      this.allocStart(byteLength);
      this._pointerStart -= byteLength;
      this._nativeBuffer.writeIntLE(value, this._pointerStart, byteLength);
    } else {
      this.allocEnd(byteLength);
      this._nativeBuffer.writeIntLE(value, this._pointerEnd, byteLength);
      this._pointerEnd += byteLength;
    }

    return this;
  }

  public writeUIntBE(value: number, byteLength: number, unshift?: boolean): this {
    if (unshift) {
      this.allocStart(byteLength);
      this._pointerStart -= byteLength;
      this._nativeBuffer.writeUIntBE(value, this._pointerStart, byteLength);
    } else {
      this.allocEnd(byteLength);
      this._nativeBuffer.writeUIntBE(value, this._pointerEnd, byteLength);
      this._pointerEnd += byteLength;
    }

    return this;
  }

  public writeUIntLE(value: number, byteLength: number, unshift?: boolean): this {
    if (unshift) {
      this.allocStart(byteLength);
      this._pointerStart -= byteLength;
      this._nativeBuffer.writeUIntLE(value, this._pointerStart, byteLength);
    } else {
      this.allocEnd(byteLength);
      this._nativeBuffer.writeUIntLE(value, this._pointerEnd, byteLength);
      this._pointerEnd += byteLength;
    }

    return this;
  }

  public writeInt8(value: number, unshift?: boolean): this {
    return this.writeIntBE(value, 1, unshift);
  }

  public writeUInt8(value: number, unshift?: boolean): this {
    return this.writeUIntBE(value, 1, unshift);
  }

  public writeInt16BE(value: number, unshift?: boolean): this {
    return this.writeIntBE(value, 2, unshift);
  }

  public writeInt16LE(value: number, unshift?: boolean): this {
    return this.writeIntLE(value, 2, unshift);
  }

  public writeUInt16BE(value: number, unshift?: boolean): this {
    return this.writeUIntBE(value, 2, unshift);
  }

  public writeUInt16LE(value: number, unshift?: boolean): this {
    return this.writeUIntLE(value, 2, unshift);
  }

  public writeInt32BE(value: number, unshift?: boolean): this {
    return this.writeIntBE(value, 4, unshift);
  }

  public writeInt32LE(value: number, unshift?: boolean): this {
    return this.writeIntLE(value, 4, unshift);
  }

  public writeUInt32BE(value: number, unshift?: boolean): this {
    return this.writeUIntBE(value, 4, unshift);
  }

  public writeUInt32LE(value: number, unshift?: boolean): this {
    return this.writeUIntLE(value, 4, unshift);
  }

  public writeFloatBE(value: number, unshift?: boolean): this {
    if (unshift) {
      this.allocStart(4);
      this._pointerStart -= 4;
      this._nativeBuffer.writeFloatBE(value, this._pointerStart);
    } else {
      this.allocEnd(4);
      this._nativeBuffer.writeFloatBE(value, this._pointerEnd);
      this._pointerEnd += 4;
    }

    return this;
  }

  public writeFloatLE(value: number, unshift?: boolean): this {
    if (unshift) {
      this.allocStart(4);
      this._pointerStart -= 4;
      this._nativeBuffer.writeFloatLE(value, this._pointerStart);
    } else {
      this.allocEnd(4);
      this._nativeBuffer.writeFloatLE(value, this._pointerEnd);
      this._pointerEnd += 4;
    }

    return this;
  }

  public writeDoubleBE(value: number, unshift?: boolean): this {
    if (unshift) {
      this.allocStart(8);
      this._pointerStart -= 8;
      this._nativeBuffer.writeDoubleBE(value, this._pointerStart);
    } else {
      this.allocEnd(8);
      this._nativeBuffer.writeDoubleBE(value, this._pointerEnd);
      this._pointerEnd += 8;
    }

    return this;
  }

  public writeDoubleLE(value: number, unshift?: boolean): this {
    if (unshift) {
      this.allocStart(8);
      this._pointerStart -= 8;
      this._nativeBuffer.writeDoubleLE(value, this._pointerStart);
    } else {
      this.allocEnd(8);
      this._nativeBuffer.writeDoubleLE(value, this._pointerEnd);
      this._pointerEnd += 8;
    }

    return this;
  }

  public readBuffer(size: number): this;
  public readBuffer(size: number, asNative: false, bufferOptions?: ExtendedBufferOptions): this;
  public readBuffer(size: number, asNative: true, bufferOptions?: ExtendedBufferOptions): Buffer;
  public readBuffer(size: number, asNative?: boolean, bufferOptions?: ExtendedBufferOptions): this | Buffer;
  public readBuffer(size: number, asNative?: boolean, bufferOptions?: ExtendedBufferOptions): this | Buffer {
    const buffer = this._nativeBuffer.slice(this._pointerStart + this._pointer, this._pointerStart + this._pointer + size);
    this._pointer += size;
    const ThisClass = <new(options?: ExtendedBufferOptions) => this>this.constructor;

    if (asNative) {
      return (typeof Buffer.from === 'function') ? Buffer.from(buffer) : new Buffer(buffer);
    }

    return (new ThisClass(bufferOptions)).writeNativeBuffer(buffer, false);
  }

  public readString(size: number, encoding?: string): string {
    this._pointer += size;
    return this._nativeBuffer.toString(encoding, this._pointerStart + this._pointer - size, this._pointerStart + this._pointer);
  }

  public readIntBE(byteLength: number): number {
    this._pointer += byteLength;
    return this._nativeBuffer.readIntBE(this._pointerStart + this._pointer - byteLength, byteLength);
  }

  public readIntLE(byteLength: number): number {
    this._pointer += byteLength;
    return this._nativeBuffer.readIntLE(this._pointerStart + this._pointer - byteLength, byteLength);
  }

  public readUIntBE(byteLength: number): number {
    this._pointer += byteLength;
    return this._nativeBuffer.readUIntBE(this._pointerStart + this._pointer - byteLength, byteLength);
  }

  public readUIntLE(byteLength: number): number {
    this._pointer += byteLength;
    return this._nativeBuffer.readUIntLE(this._pointerStart + this._pointer - byteLength, byteLength);
  }

  public readInt8(): number {
    return this.readIntBE(1);
  }

  public readUInt8(): number {
    return this.readUIntBE(1);
  }

  public readInt16BE(): number {
    return this.readIntBE(2);
  }

  public readInt16LE(): number {
    return this.readIntLE(2);
  }

  public readUInt16BE(): number {
    return this.readUIntBE(2);
  }

  public readUInt16LE(): number {
    return this.readUIntLE(2);
  }

  public readInt32BE(): number {
    return this.readIntBE(4);
  }

  public readInt32LE(): number {
    return this.readIntLE(4);
  }

  public readUInt32BE(): number {
    return this.readUIntBE(4);
  }

  public readUInt32LE(): number {
    return this.readUIntLE(4);
  }

  public readFloatBE(): number {
    this._pointer += 4;
    return this._nativeBuffer.readFloatBE(this._pointerStart + this._pointer - 4);
  }

  public readFloatLE(): number {
    this._pointer += 4;
    return this._nativeBuffer.readFloatLE(this._pointerStart + this._pointer - 4);
  }

  public readDoubleBE(): number {
    this._pointer += 8;
    return this._nativeBuffer.readDoubleBE(this._pointerStart + this._pointer - 8);
  }

  public readDoubleLE(): number {
    this._pointer += 8;
    return this._nativeBuffer.readDoubleLE(this._pointerStart + this._pointer - 8);
  }
}
