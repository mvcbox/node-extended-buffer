import { ExtendedBufferTypeError } from '../errors';

export function assertUnsignedBigInteger(value: bigint): void {
  if (typeof value !== 'bigint' || value < 0) {
    throw new ExtendedBufferTypeError('VALUE_MUST_BE_AN_UNSIGNED_BIG_INTEGER');
  }
}
