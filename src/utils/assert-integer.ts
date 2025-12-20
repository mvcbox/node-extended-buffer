export function assertInteger(value: number): void {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError('Value must be an integer');
  }
}
