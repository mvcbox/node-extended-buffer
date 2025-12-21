import { ExtendedBufferRangeError } from '../errors';

export function assertIntegerSize(value: number): void {
  if (!Number.isSafeInteger(value) || value < 1 || value > 6) {
    throw new ExtendedBufferRangeError('INVALID_INTEGER_SIZE');
  }
}
