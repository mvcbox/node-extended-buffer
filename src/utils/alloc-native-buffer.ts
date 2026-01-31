import { Buffer, kMaxLength } from 'buffer';
import { ExtendedBufferRangeError } from '../errors';
import { assertUnsignedInteger } from './assert-unsigned-integer';

const totalMem: number | undefined = (function() {
  try {
    const req: ((id: string) => unknown) | undefined =
      typeof module !== 'undefined' && typeof module.require === 'function'
        ? module.require.bind(module)
        : typeof require === 'function'
          ? require
          : undefined;

    if (!req) {
      return undefined;
    }

    const os = req('os') as { totalmem?: () => number } | undefined;

    if (typeof os?.totalmem !== 'function') {
      return undefined;
    }

    const result = os.totalmem();
    return Number.isSafeInteger(result) && result > 0 ? result : undefined;
  } catch {
    return undefined;
  }
})();

const fallbackMaxLength =
  typeof kMaxLength === 'number'
    ? kMaxLength
    : typeof (Buffer as any).kMaxLength === 'number'
      ? (Buffer as any).kMaxLength
      : typeof (Buffer as any).constants?.MAX_LENGTH === 'number'
        ? (Buffer as any).constants.MAX_LENGTH
        : Number.MAX_SAFE_INTEGER;

const maxBufferSize = typeof totalMem === 'number' ? Math.min(fallbackMaxLength, totalMem) : fallbackMaxLength;

assertUnsignedInteger(maxBufferSize);

export function allocNativeBuffer(size: number, allocSlow?: boolean): Buffer {
  assertUnsignedInteger(size);

  if (size > maxBufferSize) {
    throw new ExtendedBufferRangeError('EXCEEDING_MAXIMUM_BUFFER_SIZE');
  }

  return allocSlow ? Buffer.allocUnsafeSlow(size) : Buffer.allocUnsafe(size);
}
