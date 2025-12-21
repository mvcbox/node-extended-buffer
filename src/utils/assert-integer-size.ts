import { ExtendedBufferTypeError, ExtendedBufferRangeError } from '../errors';

export function assertIntegerSize(value: number): void {
  if (!Number.isSafeInteger(value)) {
    throw new ExtendedBufferTypeError('INVALID_INTEGER_SIZE_VALUE_TYPE');
  }

  if (value < 1 || value > 6) {
    throw new ExtendedBufferRangeError('INVALID_INTEGER_SIZE_VALUE_RANGE');
  }
}
