import { ExtendedBufferTypeError } from '../errors';

export function assertUnsignedInteger(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new ExtendedBufferTypeError('VALUE_MUST_BE_AN_UNSIGNED_INTEGER');
  }
}
