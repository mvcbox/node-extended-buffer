import * as os from 'os';
import { Buffer, kMaxLength } from 'buffer';
import { ExtendedBufferRangeError } from '../errors';
import { assertUnsignedInteger } from './assert-unsigned-integer';

const fallbackMaxLength =
  typeof kMaxLength === 'number'
    ? kMaxLength
    : typeof (Buffer as any).kMaxLength === 'number'
      ? (Buffer as any).kMaxLength
      : typeof (Buffer as any).constants?.MAX_LENGTH === 'number'
        ? (Buffer as any).constants.MAX_LENGTH
        : Number.MAX_SAFE_INTEGER;

// Prefer runtime limits when available; otherwise allow Buffer to throw RangeError.
const maxBufferSize = Math.min(fallbackMaxLength, os.totalmem());
assertUnsignedInteger(maxBufferSize);

export function allocNativeBuffer(size: number, allocSlow?: boolean): Buffer {
  assertUnsignedInteger(size);

  if (size > maxBufferSize) {
    throw new ExtendedBufferRangeError('EXCEEDING_MAXIMUM_BUFFER_SIZE');
  }

  return allocSlow ? Buffer.allocUnsafeSlow(size) : Buffer.allocUnsafe(size);
}
