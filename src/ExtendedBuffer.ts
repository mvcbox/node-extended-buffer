import { Buffer } from 'buffer';
import * as utils from './utils';
import type { ExtendedBufferOptions } from './ExtendedBufferOptions';
import { ExtendedBufferError, ExtendedBufferRangeError } from './errors';

const defaultCapacity = 16 * 1024;
const defaultCapacityStep = defaultCapacity;

export class ExtendedBuffer {
  protected _pointer!: number;
  protected _pointerEnd!: number;
  protected _pointerStart!: number;
  protected _nativeBuffer!: Buffer;
  protected readonly _capacity: number;
  protected readonly _capacityStep: number;
  protected readonly _nativeAllocSlow?: boolean;
  protected readonly _nativeReallocSlow?: boolean;

  public constructor(options?: ExtendedBufferOptions) {
    this._nativeAllocSlow = options?.nativeAllocSlow;
    this._nativeReallocSlow = options?.nativeReallocSlow;
    this._capacity = options?.capacity ?? defaultCapacity;
    this._capacityStep = options?.capacityStep ?? defaultCapacityStep;
    utils.assertUnsignedInteger(this._capacity);
    utils.assertUnsignedInteger(this._capacityStep);
    this.initExtendedBuffer();
  }

  protected createInstance(options?: ExtendedBufferOptions): this {
    const ThisClass = this.constructor as unknown as new (opts?: ExtendedBufferOptions) => this;
    return new ThisClass(options);
  }

  public get length(): number {
    return this._pointerEnd - this._pointerStart;
  }

  public get capacity(): number {
    return this._nativeBuffer.length;
  }

  public get pointer(): number {
    return this.getPointer();
  }

  public get nativeBufferView(): Buffer {
    return utils.nativeBufferSubarray(this._nativeBuffer, this._pointerStart, this._pointerEnd);
  }

  public initExtendedBuffer(): this {
    this._pointer = 0;
    this._nativeBuffer = utils.allocNativeBuffer(this._capacity, this._nativeAllocSlow);
    this._pointerStart = this._pointerEnd = Math.floor(this._capacity / 2);
    this.assertInstanceState();
    return this;
  }

  public assertInstanceState(): this {
    if (
      !this._nativeBuffer ||
      !Number.isSafeInteger(this._pointer) ||
      !Number.isSafeInteger(this._pointerStart) ||
      !Number.isSafeInteger(this._pointerEnd) ||
      !Number.isSafeInteger(this._capacity) ||
      !Number.isSafeInteger(this._capacityStep) ||
      this._pointer < 0 ||
      this._pointerStart < 0 ||
      this._pointerEnd < 0 ||
      this._capacity < 0 ||
      this._capacityStep < 0 ||
      this._pointerStart > this._pointerEnd ||
      this._pointerEnd > this._nativeBuffer.length ||
      this._pointer > (this._pointerEnd - this._pointerStart)
    ) {
      throw new ExtendedBufferError('INVALID_INSTANCE_STATE');
    }

    return this;
  }

  public clean(): this {
    return this.initExtendedBuffer();
  }

  public nativePointer(): number {
    return this._pointerStart + this._pointer;
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
      const newSize = this._nativeBuffer.length + (size - this.getWritableSize()) + this._capacityStep;
      this._nativeBuffer = utils.reallocNativeBuffer(this._nativeBuffer, newSize, this._nativeReallocSlow);
    }

    const offset = Math.floor((this.getWritableSize() - size) / 2) + size - this._pointerStart;
    this._nativeBuffer.copy(this._nativeBuffer, this._pointerStart + offset, this._pointerStart, this._pointerEnd);
    this._pointerStart += offset;
    this._pointerEnd += offset;
    this.assertInstanceState();
    return this;
  }

  public allocEnd(size: number): this {
    utils.assertUnsignedInteger(size);

    if (this.getWritableSizeEnd() >= size) {
      return this;
    }

    if (this.getWritableSize() < size) {
      const newSize = this._nativeBuffer.length + (size - this.getWritableSize()) + this._capacityStep;
      this._nativeBuffer = utils.reallocNativeBuffer(this._nativeBuffer, newSize, this._nativeReallocSlow);
    }

    const offset = this._nativeBuffer.length - Math.floor((this.getWritableSize() - size) / 2) - size - this._pointerEnd;
    this._nativeBuffer.copy(this._nativeBuffer, this._pointerStart + offset, this._pointerStart, this._pointerEnd);
    this._pointerStart += offset;
    this._pointerEnd += offset;
    this.assertInstanceState();
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
    this.discardReadData();
    const freeSize = this.getWritableSize();

    if (freeSize > this._capacityStep) {
      const reduceSize = freeSize - this._capacityStep;
      const newNativeSize = this._nativeBuffer.length - reduceSize;
      this.allocEnd(reduceSize);
      this._nativeBuffer = utils.reallocNativeBuffer(this._nativeBuffer, newNativeSize, this._nativeReallocSlow);
    }

    return this;
  }

  public discardReadData(): this {
    if (this._pointer > 0) {
      this._pointerStart += this._pointer;
      this._pointer = 0;
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
    utils.assertInteger(pointer);

    if (pointer < 0 || pointer > this.length) {
      throw new ExtendedBufferRangeError('POINTER_OUT_OF_RANGE');
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

  public writeBuffer(value: Buffer | ExtendedBuffer, unshift?: boolean): this {
    if (value instanceof Buffer) {
      return this.writeNativeBuffer(value, unshift);
    }

    return this.writeNativeBuffer(value.nativeBufferView, unshift);
  }

  public writeString(string: string, encoding?: BufferEncoding, unshift?: boolean): this {
    const bytes = Buffer.from(string, encoding);
    return this.writeNativeBuffer(bytes, unshift);
  }

  public writeIntBE(value: number, size: number, unshift?: boolean): this {
    utils.assertInteger(value);
    utils.assertIntegerSize(size);

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
    utils.assertIntegerSize(size);

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
    utils.assertIntegerSize(size);

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
    utils.assertIntegerSize(size);

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
    return this.writeUIntLE(value, 1, unshift);
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
  public readBuffer(size: number, asNative?: boolean, bufferOptions?: ExtendedBufferOptions): this | Buffer {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    let result: typeof this | Buffer;
    const buffer = utils.nativeBufferSubarray(this._nativeBuffer, this.nativePointer(), this.nativePointer() + size);

    if (asNative) {
      result = Buffer.from(buffer);
    } else {
      bufferOptions = Object.assign<ExtendedBufferOptions, ExtendedBufferOptions>({
        capacity: this._capacity,
        capacityStep: this._capacityStep,
        nativeAllocSlow: this._nativeAllocSlow,
        nativeReallocSlow: this._nativeReallocSlow
      }, bufferOptions ?? {});

      result = this.createInstance(bufferOptions).writeNativeBuffer(buffer);
    }

    this.offset(size);
    return result;
  }

  public readString(size: number, encoding?: BufferEncoding): string {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const result = this._nativeBuffer.toString(encoding, this.nativePointer(), this.nativePointer() + size);
    this.offset(size);
    return result;
  }

  public readIntBE(size: number): number {
    utils.assertIntegerSize(size);

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const result = this._nativeBuffer.readIntBE(this.nativePointer(), size);
    this.offset(size);
    return result;
  }

  public readIntLE(size: number): number {
    utils.assertIntegerSize(size);

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const result = this._nativeBuffer.readIntLE(this.nativePointer(), size);
    this.offset(size);
    return result;
  }

  public readUIntBE(size: number): number {
    utils.assertIntegerSize(size);

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const result = this._nativeBuffer.readUIntBE(this.nativePointer(), size);
    this.offset(size);
    return result;
  }

  public readUIntLE(size: number): number {
    utils.assertIntegerSize(size);

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const result = this._nativeBuffer.readUIntLE(this.nativePointer(), size);
    this.offset(size);
    return result;
  }

  public readInt8(): number {
    return this.readIntBE(1);
  }

  public readUInt8(): number {
    return this.readUIntLE(1);
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
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const result = this._nativeBuffer.readFloatBE(this.nativePointer());
    this.offset(size);
    return result;
  }

  public readFloatLE(): number {
    const size = 4;

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const result = this._nativeBuffer.readFloatLE(this.nativePointer());
    this.offset(size);
    return result;
  }

  public readDoubleBE(): number {
    const size = 8;

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const result = this._nativeBuffer.readDoubleBE(this.nativePointer());
    this.offset(size);
    return result;
  }

  public readDoubleLE(): number {
    const size = 8;

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const result = this._nativeBuffer.readDoubleLE(this.nativePointer());
    this.offset(size);
    return result;
  }
}
