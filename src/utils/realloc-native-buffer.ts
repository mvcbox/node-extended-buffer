import { Buffer } from 'buffer';
import { allocNativeBuffer } from './alloc-native-buffer';
import { assertUnsignedInteger } from './assert-unsigned-integer';

export function reallocNativeBuffer(buffer: Buffer, newSize: number, allocSlow?: boolean): Buffer {
  assertUnsignedInteger(newSize);

  if (buffer.length === newSize) {
    return buffer;
  }

  const newBuffer = allocNativeBuffer(newSize, allocSlow);
  buffer.copy(newBuffer, 0, 0, Math.min(buffer.length, newBuffer.length));
  return newBuffer;
}
