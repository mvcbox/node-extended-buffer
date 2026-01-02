import type { Buffer } from 'buffer';

export type ExtendedBufferTransaction = {
  pointer: number;
  pointerEnd: number;
  pointerStart: number;
  nativeBuffer: Buffer;
  nativePayload: Buffer;
  nativeBufferLength: number;
};
