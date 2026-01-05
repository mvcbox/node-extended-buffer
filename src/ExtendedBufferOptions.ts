import type { Buffer } from 'buffer';

export type ExtendedBufferOptions = {
  capacity?: number;
  capacityStep?: number;
  nativeAllocSlow?: boolean;
  nativeReallocSlow?: boolean;
  initNativeBuffer?: Buffer;
};
