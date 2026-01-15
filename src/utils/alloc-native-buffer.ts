import { Buffer, kMaxLength } from 'buffer';
import { ExtendedBufferRangeError } from '../errors';
import { assertUnsignedInteger } from './assert-unsigned-integer';

const maxBufferSize =
  typeof kMaxLength === 'number'
    ? kMaxLength
    : typeof (Buffer as any).kMaxLength === 'number'
      ? (Buffer as any).kMaxLength
      : typeof (Buffer as any).constants?.MAX_LENGTH === 'number'
        ? (Buffer as any).constants.MAX_LENGTH
        : Number.MAX_SAFE_INTEGER;

assertUnsignedInteger(maxBufferSize);

export function allocNativeBuffer(size: number, allocSlow?: boolean): Buffer {
  assertUnsignedInteger(size);

  if (size > maxBufferSize) {
    throw new ExtendedBufferRangeError('EXCEEDING_MAXIMUM_BUFFER_SIZE');
  }

  return allocSlow ? Buffer.allocUnsafeSlow(size) : Buffer.allocUnsafe(size);
}
