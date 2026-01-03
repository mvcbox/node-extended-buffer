import { ExtendedBufferTypeError } from '../errors';

export function assertBigInteger(value: bigint): void {
  if (typeof value !== 'bigint') {
    throw new ExtendedBufferTypeError('VALUE_MUST_BE_AN_BIG_INTEGER');
  }
}
