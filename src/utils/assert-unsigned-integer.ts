export function assertUnsignedInteger(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError('Value must be an unsigned integer');
  }
}
