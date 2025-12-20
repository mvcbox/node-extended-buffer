import * as utils from './utils';
import { Buffer, kMaxLength } from 'buffer';
import type { ExtendedBufferOptions } from  './ExtendedBufferOptions';

const defaultNativeBufferSize: number = 1024 * 1024;

export class ExtendedBuffer {
  public _pointer!: number;
  public _pointerEnd!: number;
  public _pointerStart!: number;
  public _nativeBuffer!: Buffer;
  public readonly _nativeBufferLength: number;

  public constructor(options?: ExtendedBufferOptions) {
    const nativeBufferLength = options?.nativeBufferLength ?? defaultNativeBufferSize;
    utils.assertUnsignedInteger(nativeBufferLength);
    this._nativeBufferLength = nativeBufferLength;
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

  public get nativeBufferView(): Buffer {
    return this._nativeBuffer.subarray(this._pointerStart, this._pointerEnd) as Buffer;
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
    this._nativeBuffer = Buffer.allocUnsafe(this._nativeBufferLength);
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

  public allocStart(size: number): this {
    utils.assertUnsignedInteger(size);

    if (this.getWritableSizeStart() >= size) {
      return this;
    }

    if (this.getWritableSize() < size) {
      throw new RangeError('Not enough free space');
    }

    const offset = Math.floor((this.getWritableSize() - size) / 2) + size - this._pointerStart;
    this._nativeBuffer.copy(this._nativeBuffer, this._pointerStart + offset, this._pointerStart, this._pointerEnd);
    this._pointerStart += offset;
    this._pointerEnd += offset;
    return this;
  }

  public allocEnd(size: number): this {
    utils.assertUnsignedInteger(size);

    if (this.getWritableSizeEnd() >= size) {
      return this;
    }

    if (this.getWritableSize() < size) {
      throw new RangeError('Not enough free space');
    }

    const offset = this._nativeBuffer.length - Math.floor((this.getWritableSize() - size) / 2) - size - this._pointerEnd;
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
      buffer.copy(this._nativeBuffer, this._pointerStart - buffer.length);
      this._pointerStart -= buffer.length;
    } else {
      this.allocEnd(buffer.length);
      buffer.copy(this._nativeBuffer, this._pointerEnd);
      this._pointerEnd += buffer.length;
    }

    return this;
  }

  public gc(): this {
    if (this._pointer > 0) {
      const payload = this._nativeBuffer.subarray(this._pointerStart + this._pointer, this._pointerEnd) as Buffer;
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
    utils.assertUnsignedInteger(pointer);

    if (pointer > this.length) {
      throw new RangeError('"pointer" out of range');
    }

    this._pointer = pointer;
    return this;
  }

  public getPointer(): number {
    return this._pointer;
  }

  public offset(offset: number): this {
    utils.assertInteger(offset);
    return this.setPointer(this._pointer + offset);
  }

  public isReadable(size: number): boolean {
    utils.assertUnsignedInteger(size);
    return this.getReadableSize() >= size;
  }

  public isWritable(size: number): boolean {
    utils.assertUnsignedInteger(size);
    return this.getWritableSize() >= size;
  }

  public writeBuffer(value: Buffer | ExtendedBuffer, unshift?: boolean): this {
    if (value instanceof Buffer) {
      return this.writeNativeBuffer(value, unshift);
    }

    if (value instanceof ExtendedBuffer) {
      return this.writeNativeBuffer(value.nativeBufferView, unshift);
    }

    throw new TypeError('"value" has an invalid type');
  }

  public writeString(string: string, encoding?: string, unshift?: boolean): this {
    const size = Buffer.byteLength(string, encoding);

    if (unshift) {
      this.allocStart(size);
      this._nativeBuffer.write(string, this._pointerStart - size, size, encoding);
      this._pointerStart -= size;
    } else {
      this.allocEnd(size);
      this._nativeBuffer.write(string, this._pointerEnd, size, encoding);
      this._pointerEnd += size;
    }

    return this;
  }

  public writeIntBE(value: number, size: number, unshift?: boolean): this {
    utils.assertInteger(value);
    utils.assertUnsignedInteger(size);

    if (unshift) {
      this.allocStart(size);
      this._nativeBuffer.writeIntBE(value, this._pointerStart - size, size);
      this._pointerStart -= size;
    } else {
      this.allocEnd(size);
      this._nativeBuffer.writeIntBE(value, this._pointerEnd, size);
      this._pointerEnd += size;
    }

    return this;
  }

  public writeIntLE(value: number, size: number, unshift?: boolean): this {
    utils.assertInteger(value);
    utils.assertUnsignedInteger(size);

    if (unshift) {
      this.allocStart(size);
      this._nativeBuffer.writeIntLE(value, this._pointerStart - size, size);
      this._pointerStart -= size;
    } else {
      this.allocEnd(size);
      this._nativeBuffer.writeIntLE(value, this._pointerEnd, size);
      this._pointerEnd += size;
    }

    return this;
  }

  public writeUIntBE(value: number, size: number, unshift?: boolean): this {
    utils.assertUnsignedInteger(value);
    utils.assertUnsignedInteger(size);

    if (unshift) {
      this.allocStart(size);
      this._nativeBuffer.writeUIntBE(value, this._pointerStart - size, size);
      this._pointerStart -= size;
    } else {
      this.allocEnd(size);
      this._nativeBuffer.writeUIntBE(value, this._pointerEnd, size);
      this._pointerEnd += size;
    }

    return this;
  }

  public writeUIntLE(value: number, size: number, unshift?: boolean): this {
    utils.assertUnsignedInteger(value);
    utils.assertUnsignedInteger(size);

    if (unshift) {
      this.allocStart(size);
      this._nativeBuffer.writeUIntLE(value, this._pointerStart - size, size);
      this._pointerStart -= size;
    } else {
      this.allocEnd(size);
      this._nativeBuffer.writeUIntLE(value, this._pointerEnd, size);
      this._pointerEnd += size;
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
      this._nativeBuffer.writeFloatBE(value, this._pointerStart - 4);
      this._pointerStart -= 4;
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
      this._nativeBuffer.writeFloatLE(value, this._pointerStart - 4);
      this._pointerStart -= 4;
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
      this._nativeBuffer.writeDoubleBE(value, this._pointerStart - 8);
      this._pointerStart -= 8;
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
      this._nativeBuffer.writeDoubleLE(value, this._pointerStart - 8);
      this._pointerStart -= 8;
    } else {
      this.allocEnd(8);
      this._nativeBuffer.writeDoubleLE(value, this._pointerEnd);
      this._pointerEnd += 8;
    }

    return this;
  }

  public readBuffer(size: number): this;
  public readBuffer(size: number, asNative: true): Buffer;
  public readBuffer(size: number, asNative: false, bufferOptions?: ExtendedBufferOptions): this;
  //public readBuffer(size: number, asNative?: boolean, bufferOptions?: ExtendedBufferOptions): this | Buffer;
  public readBuffer(size: number, asNative?: boolean, bufferOptions?: ExtendedBufferOptions): this | Buffer {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }

    let result: typeof this | Buffer;
    const buffer = this._nativeBuffer.subarray(this._pointerStart + this._pointer, this._pointerStart + this._pointer + size) as Buffer;

    if (asNative) {
      result = Buffer.from(buffer);
    } else {
      bufferOptions = Object.assign<ExtendedBufferOptions, ExtendedBufferOptions>({
        nativeBufferLength: Math.max(size, 1)
      }, bufferOptions ?? {});

      if (typeof bufferOptions.nativeBufferLength !== 'number' || bufferOptions.nativeBufferLength < size) {
        throw new Error('Insufficient size of new buffer');
      }

      const ThisClass = <new(options?: ExtendedBufferOptions) => this>this.constructor;
      result = (new ThisClass(bufferOptions)).writeNativeBuffer(buffer, false);
    }

    this.offset(size);
    return result;
  }

  public readString(size: number, encoding?: string): string {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }
    
    const result = this._nativeBuffer.toString(encoding, this._pointerStart + this._pointer, this._pointerStart + this._pointer + size);
    this.offset(size);
    return result;
  }

  public readIntBE(size: number): number {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }

    const result = this._nativeBuffer.readIntBE(this._pointerStart + this._pointer, size);
    this.offset(size);
    return result;
  }

  public readIntLE(size: number): number {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }

    const result = this._nativeBuffer.readIntLE(this._pointerStart + this._pointer, size);
    this.offset(size);
    return result;
  }

  public readUIntBE(size: number): number {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }

    const result = this._nativeBuffer.readUIntBE(this._pointerStart + this._pointer, size);
    this.offset(size);
    return result;
  }

  public readUIntLE(size: number): number {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }

    const result = this._nativeBuffer.readUIntLE(this._pointerStart + this._pointer, size);
    this.offset(size);
    return result;
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
    const size = 4;

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }

    const result = this._nativeBuffer.readFloatBE(this._pointerStart + this._pointer);
    this.offset(size);
    return result;
  }

  public readFloatLE(): number {
    const size = 4;

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }

    const result = this._nativeBuffer.readFloatLE(this._pointerStart + this._pointer);
    this.offset(size);
    return result;
  }

  public readDoubleBE(): number {
    const size = 8;

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }

    const result = this._nativeBuffer.readDoubleBE(this._pointerStart + this._pointer);
    this.offset(size);
    return result;
  }

  public readDoubleLE(): number {
    const size = 8;

    if (!this.isReadable(size)) {
      throw new RangeError('"size" out of range');
    }

    const result = this._nativeBuffer.readDoubleLE(this._pointerStart + this._pointer);
    this.offset(size);
    return result;
  }
}
