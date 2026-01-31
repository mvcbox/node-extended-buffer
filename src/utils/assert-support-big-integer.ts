import { Buffer } from 'buffer';
import { ExtendedBufferUnsupportedError } from '../errors';

const requiredMethods = [
  'readBigUInt64LE',
  'readBigUInt64BE',
  'readBigInt64LE',
  'readBigInt64BE',
  'writeBigUInt64LE',
  'writeBigUInt64BE',
  'writeBigInt64LE',
  'writeBigInt64BE'
] as const;

const isSupported =
  typeof BigInt === 'function' &&
  requiredMethods.every(method => typeof (Buffer.prototype as any)[method] === 'function');

export function assertSupportBigInteger(): void {
  if (!isSupported) {
    throw new ExtendedBufferUnsupportedError('EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT');
  }
}
