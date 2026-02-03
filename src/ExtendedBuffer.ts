import { Buffer } from 'buffer';
import * as utils from './utils';
import type { ExtendedBufferOptions } from './ExtendedBufferOptions';
import type { ExtendedBufferTransaction } from './ExtendedBufferTransaction';
import {
  ExtendedBufferError,
  ExtendedBufferTypeError,
  ExtendedBufferRangeError
} from './errors';

const DEFAULT_CAPACITY = 16 * 1024;
const DEFAULT_CAPACITY_STEP = DEFAULT_CAPACITY;
const globalScope = utils.getGlobalContext();

export class ExtendedBuffer<EBO extends ExtendedBufferOptions = ExtendedBufferOptions> {
  protected _pointer!: number;
  protected _pointerEnd!: number;
  protected _pointerStart!: number;
  protected _nativeBuffer!: Buffer;
  protected readonly _capacity: number;
  protected readonly _capacityStep: number;
  protected readonly _nativeAllocSlow?: boolean;
  protected readonly _nativeReallocSlow?: boolean;
  protected _transaction?: ExtendedBufferTransaction;

  public constructor(options?: ExtendedBufferOptions) {
    this._nativeAllocSlow = options?.nativeAllocSlow;
    this._nativeReallocSlow = options?.nativeReallocSlow;
    this._capacity = options?.capacity ?? DEFAULT_CAPACITY;
    this._capacityStep = options?.capacityStep ?? DEFAULT_CAPACITY_STEP;
    utils.assertUnsignedInteger(this._capacity);
    utils.assertUnsignedInteger(this._capacityStep);
    this.initExtendedBuffer(options?.initNativeBuffer);
  }

  protected createInstanceOptions(options?: ExtendedBufferOptions): ExtendedBufferOptions {
    return Object.assign<ExtendedBufferOptions, ExtendedBufferOptions>({
      capacity: this._capacity,
      capacityStep: this._capacityStep,
      nativeAllocSlow: this._nativeAllocSlow,
      nativeReallocSlow: this._nativeReallocSlow
    }, options ?? {});
  }

  protected createInstance(options?: EBO): this {
    const ThisClass = this.constructor as unknown as new (opts?: ExtendedBufferOptions) => this;
    return new ThisClass(this.createInstanceOptions(options));
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

  public get bufferView(): this {
    return this.createInstance({
      initNativeBuffer: this.nativeBufferView
    } as EBO);
  }

  public initExtendedBuffer(initNativeBuffer?: Buffer): this {
    this._pointer = 0;

    if (initNativeBuffer) {
      this._nativeBuffer = initNativeBuffer;
      this._pointerStart = 0;
      this._pointerEnd = this._nativeBuffer.length;
    } else {
      this._nativeBuffer = utils.allocNativeBuffer(this._capacity, this._nativeAllocSlow);
      this._pointerStart = this._pointerEnd = Math.floor(this._capacity / 2);
    }

    this.assertInstanceState();
    return this;
  }

  public assertInstanceState(): this {
    if (
      !Buffer.isBuffer(this._nativeBuffer) ||
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

  public transaction<T>(callback: () => T): T {
    if (this._transaction) {
      return callback();
    }

    this._transaction = {
      pointer: this._pointer,
      pointerEnd: this._pointerEnd,
      pointerStart: this._pointerStart,
      nativeBuffer: this._nativeBuffer,
      nativeBufferLength: this._nativeBuffer.length,
      nativePayload: Buffer.from(utils.nativeBufferSubarray(this._nativeBuffer, this._pointerStart, this._pointerEnd))
    };

    try {
      return callback();
    } catch (e) {
      this._transaction.nativePayload.copy(this._transaction.nativeBuffer, this._transaction.pointerStart);
      this._nativeBuffer = this._transaction.nativeBuffer;
      this._pointer = this._transaction.pointer;
      this._pointerEnd = this._transaction.pointerEnd;
      this._pointerStart = this._transaction.pointerStart;
      this.assertInstanceState();
      throw e;
    } finally {
      this._transaction = undefined;
    }
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
    if (typeof globalScope?.gc === 'function') {
      globalScope.gc();
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

  public writeBuffer(value: Buffer | ExtendedBuffer<ExtendedBufferOptions>, unshift?: boolean): this {
    if (value instanceof ExtendedBuffer) {
      return this.writeNativeBuffer(value.nativeBufferView, unshift);
    }

    if (Buffer.isBuffer(value)) {
      return this.writeNativeBuffer(value, unshift);
    }

    throw new ExtendedBufferTypeError('INVALID_BUFFER_TYPE');
  }

  public writeString(string: string, encoding?: BufferEncoding, unshift?: boolean): this {
    const bytes = Buffer.from(string, encoding);
    return this.writeNativeBuffer(bytes, unshift);
  }

  public writeIntCommon(
    method: 'writeIntBE' | 'writeIntLE' | 'writeUIntBE' | 'writeUIntLE',
    value: number, size: number, unsigned: boolean, unshift?: boolean
  ): this {
    if (unsigned) {
      utils.assertUnsignedInteger(value);
    } else {
      utils.assertInteger(value);
    }

    utils.assertIntegerSize(size);
    return this.writeIntCommonUnsafe(method, value, size, unshift);
  }

  public writeIntCommonUnsafe(
    method: 'writeIntBE' | 'writeIntLE' | 'writeUIntBE' | 'writeUIntLE',
    value: number, size: number, unshift?: boolean
  ): this {
    if (unshift) {
      this.allocStart(size);
      const offset = this._pointerStart - size;

      switch (method) {
        case 'writeIntBE':
          this._nativeBuffer.writeIntBE(value, offset, size);
          break;
        case 'writeIntLE':
          this._nativeBuffer.writeIntLE(value, offset, size);
          break;
        case 'writeUIntBE':
          this._nativeBuffer.writeUIntBE(value, offset, size);
          break;
        case 'writeUIntLE':
          this._nativeBuffer.writeUIntLE(value, offset, size);
          break;
        default:
          throw new ExtendedBufferError('INVALID_INT_WRITE_METHOD');
      }

      this._pointerStart -= size;
    } else {
      this.allocEnd(size);
      const offset = this._pointerEnd;

      switch (method) {
        case 'writeIntBE':
          this._nativeBuffer.writeIntBE(value, offset, size);
          break;
        case 'writeIntLE':
          this._nativeBuffer.writeIntLE(value, offset, size);
          break;
        case 'writeUIntBE':
          this._nativeBuffer.writeUIntBE(value, offset, size);
          break;
        case 'writeUIntLE':
          this._nativeBuffer.writeUIntLE(value, offset, size);
          break;
        default:
          throw new ExtendedBufferError('INVALID_INT_WRITE_METHOD');
      }

      this._pointerEnd += size;
    }

    return this;
  }

  public writeIntBE(value: number, size: number, unshift?: boolean): this {
    return this.writeIntCommon('writeIntBE', value, size, false, unshift);
  }

  public writeIntLE(value: number, size: number, unshift?: boolean): this {
    return this.writeIntCommon('writeIntLE', value, size, false, unshift);
  }

  public writeUIntBE(value: number, size: number, unshift?: boolean): this {
    return this.writeIntCommon('writeUIntBE', value, size, true, unshift);
  }

  public writeUIntLE(value: number, size: number, unshift?: boolean): this {
    return this.writeIntCommon('writeUIntLE', value, size, true, unshift);
  }

  public writeInt8(value: number, unshift?: boolean): this {
    utils.assertInteger(value);
    return this.writeIntCommonUnsafe('writeIntLE', value, 1, unshift);
  }

  public writeUInt8(value: number, unshift?: boolean): this {
    utils.assertUnsignedInteger(value);
    return this.writeIntCommonUnsafe('writeUIntLE', value, 1, unshift);
  }

  public writeInt16BE(value: number, unshift?: boolean): this {
    utils.assertInteger(value);
    return this.writeIntCommonUnsafe('writeIntBE', value, 2, unshift);
  }

  public writeInt16LE(value: number, unshift?: boolean): this {
    utils.assertInteger(value);
    return this.writeIntCommonUnsafe('writeIntLE', value, 2, unshift);
  }

  public writeUInt16BE(value: number, unshift?: boolean): this {
    utils.assertUnsignedInteger(value);
    return this.writeIntCommonUnsafe('writeUIntBE', value, 2, unshift);
  }

  public writeUInt16LE(value: number, unshift?: boolean): this {
    utils.assertUnsignedInteger(value);
    return this.writeIntCommonUnsafe('writeUIntLE', value, 2, unshift);
  }

  public writeInt32BE(value: number, unshift?: boolean): this {
    utils.assertInteger(value);
    return this.writeIntCommonUnsafe('writeIntBE', value, 4, unshift);
  }

  public writeInt32LE(value: number, unshift?: boolean): this {
    utils.assertInteger(value);
    return this.writeIntCommonUnsafe('writeIntLE', value, 4, unshift);
  }

  public writeUInt32BE(value: number, unshift?: boolean): this {
    utils.assertUnsignedInteger(value);
    return this.writeIntCommonUnsafe('writeUIntBE', value, 4, unshift);
  }

  public writeUInt32LE(value: number, unshift?: boolean): this {
    utils.assertUnsignedInteger(value);
    return this.writeIntCommonUnsafe('writeUIntLE', value, 4, unshift);
  }

  public writeBigInt64Common(
    method: 'writeBigInt64BE' | 'writeBigInt64LE' | 'writeBigUInt64BE' | 'writeBigUInt64LE',
    value: bigint, unsigned: boolean, unshift?: boolean
  ): this {
    utils.assertSupportBigInteger();

    if (unsigned) {
      utils.assertUnsignedBigInteger(value);
    } else {
      utils.assertBigInteger(value);
    }

    return this.writeBigInt64CommonUnsafe(method, value, unshift);
  }

  public writeBigInt64CommonUnsafe(
    method: 'writeBigInt64BE' | 'writeBigInt64LE' | 'writeBigUInt64BE' | 'writeBigUInt64LE',
    value: bigint, unshift?: boolean
  ): this {
    const size = 8;

    if (unshift) {
      this.allocStart(size);
      const offset = this._pointerStart - size;

      switch (method) {
        case 'writeBigInt64BE':
          this._nativeBuffer.writeBigInt64BE(value, offset);
          break;
        case 'writeBigInt64LE':
          this._nativeBuffer.writeBigInt64LE(value, offset);
          break;
        case 'writeBigUInt64BE':
          this._nativeBuffer.writeBigUInt64BE(value, offset);
          break;
        case 'writeBigUInt64LE':
          this._nativeBuffer.writeBigUInt64LE(value, offset);
          break;
        default:
          throw new ExtendedBufferError('INVALID_BIGINT_WRITE_METHOD');
      }

      this._pointerStart -= size;
    } else {
      this.allocEnd(size);
      const offset = this._pointerEnd;

      switch (method) {
        case 'writeBigInt64BE':
          this._nativeBuffer.writeBigInt64BE(value, offset);
          break;
        case 'writeBigInt64LE':
          this._nativeBuffer.writeBigInt64LE(value, offset);
          break;
        case 'writeBigUInt64BE':
          this._nativeBuffer.writeBigUInt64BE(value, offset);
          break;
        case 'writeBigUInt64LE':
          this._nativeBuffer.writeBigUInt64LE(value, offset);
          break;
        default:
          throw new ExtendedBufferError('INVALID_BIGINT_WRITE_METHOD');
      }

      this._pointerEnd += size;
    }

    return this;
  }

  public writeBigInt64BE(value: bigint, unshift?: boolean): this {
    return this.writeBigInt64Common('writeBigInt64BE', value, false, unshift);
  }

  public writeBigInt64LE(value: bigint, unshift?: boolean): this {
    return this.writeBigInt64Common('writeBigInt64LE', value, false, unshift);
  }

  public writeBigUInt64BE(value: bigint, unshift?: boolean): this {
    return this.writeBigInt64Common('writeBigUInt64BE', value, true, unshift);
  }

  public writeBigUInt64LE(value: bigint, unshift?: boolean): this {
    return this.writeBigInt64Common('writeBigUInt64LE', value, true, unshift);
  }

  public writeFloatingPointCommon(
    method: 'writeFloatBE' | 'writeFloatLE' | 'writeDoubleBE' | 'writeDoubleLE',
    value: number, size: 4 | 8, unshift?: boolean
  ): this {
    if (unshift) {
      this.allocStart(size);
      const offset = this._pointerStart - size;

      switch (method) {
        case 'writeFloatBE':
          this._nativeBuffer.writeFloatBE(value, offset);
          break;
        case 'writeFloatLE':
          this._nativeBuffer.writeFloatLE(value, offset);
          break;
        case 'writeDoubleBE':
          this._nativeBuffer.writeDoubleBE(value, offset);
          break;
        case 'writeDoubleLE':
          this._nativeBuffer.writeDoubleLE(value, offset);
          break;
        default:
          throw new ExtendedBufferError('INVALID_FLOATING_POINT_WRITE_METHOD');
      }

      this._pointerStart -= size;
    } else {
      this.allocEnd(size);
      const offset = this._pointerEnd;

      switch (method) {
        case 'writeFloatBE':
          this._nativeBuffer.writeFloatBE(value, offset);
          break;
        case 'writeFloatLE':
          this._nativeBuffer.writeFloatLE(value, offset);
          break;
        case 'writeDoubleBE':
          this._nativeBuffer.writeDoubleBE(value, offset);
          break;
        case 'writeDoubleLE':
          this._nativeBuffer.writeDoubleLE(value, offset);
          break;
        default:
          throw new ExtendedBufferError('INVALID_FLOATING_POINT_WRITE_METHOD');
      }

      this._pointerEnd += size;
    }

    return this;
  }

  public writeFloatBE(value: number, unshift?: boolean): this {
    return this.writeFloatingPointCommon('writeFloatBE', value, 4, unshift);
  }

  public writeFloatLE(value: number, unshift?: boolean): this {
    return this.writeFloatingPointCommon('writeFloatLE', value, 4, unshift);
  }

  public writeDoubleBE(value: number, unshift?: boolean): this {
    return this.writeFloatingPointCommon('writeDoubleBE', value, 8, unshift);
  }

  public writeDoubleLE(value: number, unshift?: boolean): this {
    return this.writeFloatingPointCommon('writeDoubleLE', value, 8, unshift);
  }

  public readBuffer(size: number): this;
  public readBuffer(size: number, asNative: true): Buffer;
  public readBuffer(size: number, asNative: false, bufferOptions?: EBO): this;
  public readBuffer(size: number, asNative?: boolean, bufferOptions?: EBO): this | Buffer {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const nativePointer = this.nativePointer();
    const nativeBuffer = utils.nativeBufferSubarray(this._nativeBuffer, nativePointer, nativePointer + size);
    const result = asNative ? Buffer.from(nativeBuffer) : this.createInstance(bufferOptions).writeNativeBuffer(nativeBuffer);
    this.offset(size);
    return result;
  }

  public readString(size: number, encoding?: BufferEncoding): string {
    utils.assertUnsignedInteger(size);

    if (!this.isReadable(size)) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const nativePointer = this.nativePointer();
    const result = this._nativeBuffer.toString(encoding, nativePointer, nativePointer + size);
    this.offset(size);
    return result;
  }

  public readIntCommon(method: 'readIntBE' | 'readIntLE' | 'readUIntBE' | 'readUIntLE', size: number): number {
    utils.assertIntegerSize(size);
    return this.readIntCommonUnsafe(method, size);
  }

  public readIntCommonUnsafe(
    method: 'readIntBE' | 'readIntLE' | 'readUIntBE' | 'readUIntLE',
    size: number
  ): number {
    if (this.getReadableSize() < size) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const offset = this.nativePointer();
    let result: number;

    switch (method) {
      case 'readIntBE':
        result = this._nativeBuffer.readIntBE(offset, size);
        break;
      case 'readIntLE':
        result = this._nativeBuffer.readIntLE(offset, size);
        break;
      case 'readUIntBE':
        result = this._nativeBuffer.readUIntBE(offset, size);
        break;
      case 'readUIntLE':
        result = this._nativeBuffer.readUIntLE(offset, size);
        break;
      default:
        throw new ExtendedBufferError('INVALID_INT_READ_METHOD');
    }

    this._pointer += size;
    return result;
  }

  public readIntBE(size: number): number {
    return this.readIntCommon('readIntBE', size);
  }

  public readIntLE(size: number): number {
    return this.readIntCommon('readIntLE', size);
  }

  public readUIntBE(size: number): number {
    return this.readIntCommon('readUIntBE', size);
  }

  public readUIntLE(size: number): number {
    return this.readIntCommon('readUIntLE', size);
  }

  public readInt8(): number {
    return this.readIntCommonUnsafe('readIntLE', 1);
  }

  public readUInt8(): number {
    return this.readIntCommonUnsafe('readUIntLE', 1);
  }

  public readInt16BE(): number {
    return this.readIntCommonUnsafe('readIntBE', 2);
  }

  public readInt16LE(): number {
    return this.readIntCommonUnsafe('readIntLE', 2);
  }

  public readUInt16BE(): number {
    return this.readIntCommonUnsafe('readUIntBE', 2);
  }

  public readUInt16LE(): number {
    return this.readIntCommonUnsafe('readUIntLE', 2);
  }

  public readInt32BE(): number {
    return this.readIntCommonUnsafe('readIntBE', 4);
  }

  public readInt32LE(): number {
    return this.readIntCommonUnsafe('readIntLE', 4);
  }

  public readUInt32BE(): number {
    return this.readIntCommonUnsafe('readUIntBE', 4);
  }

  public readUInt32LE(): number {
    return this.readIntCommonUnsafe('readUIntLE', 4);
  }

  public readBigInt64Common(method: 'readBigInt64BE' | 'readBigInt64LE' | 'readBigUInt64BE' | 'readBigUInt64LE'): bigint {
    utils.assertSupportBigInteger();
    return this.readBigInt64CommonUnsafe(method);
  }

  public readBigInt64CommonUnsafe(
    method: 'readBigInt64BE' | 'readBigInt64LE' | 'readBigUInt64BE' | 'readBigUInt64LE'
  ): bigint {
    const size = 8;

    if (this.getReadableSize() < size) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const offset = this.nativePointer();
    let result: bigint;

    switch (method) {
      case 'readBigInt64BE':
        result = this._nativeBuffer.readBigInt64BE(offset);
        break;
      case 'readBigInt64LE':
        result = this._nativeBuffer.readBigInt64LE(offset);
        break;
      case 'readBigUInt64BE':
        result = this._nativeBuffer.readBigUInt64BE(offset);
        break;
      case 'readBigUInt64LE':
        result = this._nativeBuffer.readBigUInt64LE(offset);
        break;
      default:
        throw new ExtendedBufferError('INVALID_BIGINT_READ_METHOD');
    }

    this._pointer += size;
    return result;
  }

  public readBigInt64BE(): bigint {
    return this.readBigInt64Common('readBigInt64BE');
  }

  public readBigInt64LE(): bigint {
    return this.readBigInt64Common('readBigInt64LE');
  }

  public readBigUInt64BE(): bigint {
    return this.readBigInt64Common('readBigUInt64BE');
  }

  public readBigUInt64LE(): bigint {
    return this.readBigInt64Common('readBigUInt64LE');
  }

  public readFloatingPointCommon(
    method: 'readFloatBE' | 'readFloatLE' | 'readDoubleBE' | 'readDoubleLE', size: 4 | 8
  ): number {
    utils.assertUnsignedInteger(size);
    return this.readFloatingPointCommonUnsafe(method, size);
  }

  public readFloatingPointCommonUnsafe(
    method: 'readFloatBE' | 'readFloatLE' | 'readDoubleBE' | 'readDoubleLE',
    size: 4 | 8
  ): number {
    if (this.getReadableSize() < size) {
      throw new ExtendedBufferRangeError('SIZE_OUT_OF_RANGE');
    }

    const offset = this.nativePointer();
    let result: number;

    switch (method) {
      case 'readFloatBE':
        result = this._nativeBuffer.readFloatBE(offset);
        break;
      case 'readFloatLE':
        result = this._nativeBuffer.readFloatLE(offset);
        break;
      case 'readDoubleBE':
        result = this._nativeBuffer.readDoubleBE(offset);
        break;
      case 'readDoubleLE':
        result = this._nativeBuffer.readDoubleLE(offset);
        break;
      default:
        throw new ExtendedBufferError('INVALID_FLOATING_POINT_READ_METHOD');
    }

    this._pointer += size;
    return result;
  }

  public readFloatBE(): number {
    return this.readFloatingPointCommonUnsafe('readFloatBE', 4);
  }

  public readFloatLE(): number {
    return this.readFloatingPointCommonUnsafe('readFloatLE', 4);
  }

  public readDoubleBE(): number {
    return this.readFloatingPointCommonUnsafe('readDoubleBE', 8);
  }

  public readDoubleLE(): number {
    return this.readFloatingPointCommonUnsafe('readDoubleLE', 8);
  }
}
