// Resolve the best available global object across environments.
declare const self: unknown;
declare const window: unknown;

export function getGlobalContext(): NodeJS.Global | undefined {
  if (typeof globalThis !== 'undefined') {
    return globalThis as unknown as NodeJS.Global;
  }

  if (typeof self !== 'undefined') {
    return self as unknown as NodeJS.Global;
  }

  if (typeof window !== 'undefined') {
    return window as unknown as NodeJS.Global;
  }

  if (typeof global !== 'undefined') {
    return global as unknown as NodeJS.Global;
  }

  try {
    return Function('return this')() as unknown as NodeJS.Global;
  } catch {
    return undefined;
  }
}
