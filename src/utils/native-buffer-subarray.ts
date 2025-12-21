import { Buffer } from 'buffer';

// Fix bug https://github.com/feross/buffer/issues/329
const sliceFallback = !(Buffer.allocUnsafe(1).subarray(0) instanceof Buffer);

export function nativeBufferSubarray(buffer: Buffer, begin?: number, end?: number): Buffer {
  return sliceFallback ? buffer.slice(begin, end) : (buffer.subarray(begin, end) as Buffer);
}
