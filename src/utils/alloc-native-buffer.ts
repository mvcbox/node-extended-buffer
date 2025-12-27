import * as os from 'os';
import { Buffer, kMaxLength } from 'buffer';
import { ExtendedBufferRangeError } from '../errors';
import { assertUnsignedInteger } from './assert-unsigned-integer';

const maxBufferSize = Math.min(kMaxLength, os.totalmem());
assertUnsignedInteger(maxBufferSize);

export function allocNativeBuffer(size: number, allocSlow?: boolean): Buffer {
  assertUnsignedInteger(size);

  if (size > maxBufferSize) {
    throw new ExtendedBufferRangeError('EXCEEDING_MAXIMUM_BUFFER_SIZE');
  }

  return allocSlow ? Buffer.allocUnsafeSlow(size) : Buffer.allocUnsafe(size);
}
