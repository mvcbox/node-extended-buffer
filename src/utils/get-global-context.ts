// Resolve the best available global object across environments.
declare const self: unknown;
declare const window: unknown;

type GlobalContext = typeof global & {
  gc?: () => void;
};

export function getGlobalContext(): GlobalContext | undefined {
  if (typeof globalThis !== 'undefined') {
    return globalThis as unknown as GlobalContext;
  }

  if (typeof self !== 'undefined') {
    return self as unknown as GlobalContext;
  }

  if (typeof window !== 'undefined') {
    return window as unknown as GlobalContext;
  }

  if (typeof global !== 'undefined') {
    return global as GlobalContext;
  }

  try {
    return Function('return this')() as unknown as GlobalContext;
  } catch {
    return undefined;
  }
}
