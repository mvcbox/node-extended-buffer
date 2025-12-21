import { Buffer, kMaxLength } from 'buffer';
import { ExtendedBufferRangeError } from '../errors';
import { assertUnsignedInteger } from './assert-unsigned-integer';

export function allocNativeBuffer(size: number): Buffer {
  assertUnsignedInteger(size);
  assertUnsignedInteger(kMaxLength);

  if (size > kMaxLength) {
    throw new ExtendedBufferRangeError('EXCEEDING_MAXIMUM_BUFFER_SIZE');
  }

  return Buffer.allocUnsafe(size);
}
