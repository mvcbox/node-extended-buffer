import { Buffer } from 'buffer';
import { ExtendedBufferUnsupportedError } from '../errors';

export function assertSupportBigInteger(): void {
  let isSupported = false;

  try {
    isSupported = typeof BigInt(0) === 'bigint';
  } catch (e) {}

  if (!isSupported || typeof Buffer.prototype.readBigUInt64LE !== 'function') {
    throw new ExtendedBufferUnsupportedError('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT');
  }
}
