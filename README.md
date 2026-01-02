[![npm version](https://badge.fury.io/js/extended-buffer.svg)](https://badge.fury.io/js/extended-buffer)

# ExtendedBuffer

`ExtendedBuffer` is a growable binary buffer built on top of Node.js `Buffer`.
It keeps an internal **read pointer** (similar to a stream cursor) and supports **appending** data at the end or **prepending** data at the start.

---

## Install
```bash
npm install extended-buffer
```

---

## Quick start

```ts
import { ExtendedBuffer } from 'extended-buffer';

const b = new ExtendedBuffer();

b.writeString("OK");          // append
b.writeUInt16BE(1337);        // append

console.log(b.readString(2)); // "OK"
console.log(b.readUInt16BE()); // 1337
```

---

## Core concepts

### Stored data vs readable data

The buffer stores a contiguous region of bytes. A separate **read pointer** tracks how many bytes were already consumed.

- `length` — total stored bytes (**including already-read bytes**).
- `getReadableSize()` — unread bytes remaining.
- `pointer` / `getPointer()` — current read pointer (0…`length`).
- `nativePointer()` — absolute index inside the underlying `Buffer` for the next read.

### Views

- `nativeBufferView` — a `Buffer` view of **all stored bytes** (from the start of stored data to the end).
- If you need only unread bytes, you can derive it:

```ts
const unread = b.nativeBufferView.subarray(b.pointer);
```

---

## Construction and options

```ts
type ExtendedBufferOptions = {
  capacity?: number;            // initial native buffer size (bytes)
  capacityStep?: number;        // how much to grow when resizing
  nativeAllocSlow?: boolean;    // using Buffer.allocUnsafeSlow() when initializing ExtendedBuffer
  nativeReallocSlow?: boolean;  // using Buffer.allocUnsafeSlow() for further reallocations
};
```

Default values:

- `capacity`: `16 * 1024` bytes (16 KiB)
- `capacityStep`: same as `capacity`
- `nativeAllocSlow`: `false`
- `nativeReallocSlow`: `false`

Example:

```ts
const b = new ExtendedBuffer({
  capacity: 1024 * 1024,
  capacityStep: 1024 * 1024,
  nativeAllocSlow: true,
  nativeReallocSlow: true
});
```

---

## Writing data

Most write methods accept an optional `unshift?: boolean`:

- `unshift = false` (default): append to the end
- `unshift = true`: prepend to the start

### Buffers and strings

```ts
b.writeNativeBuffer(Buffer.from([1, 2, 3]));
b.writeBuffer(Buffer.from([4, 5, 6]));      // alias that also accepts ExtendedBuffer
b.writeString("hello", "utf8");
```

Prepend example:

```ts
b.writeString("payload");
b.writeUInt16BE(7, true); // prepend length/header
```

### Integers

Variable-width (size must be **1…6** bytes):

```ts
b.writeIntBE(-10, 3);
b.writeUIntLE(5000, 4);
```

Fixed-width helpers:

- `writeInt8`, `writeUInt8`
- `writeInt16BE`, `writeInt16LE`, `writeUInt16BE`, `writeUInt16LE`
- `writeInt32BE`, `writeInt32LE`, `writeUInt32BE`, `writeUInt32LE`

### Floating point

- `writeFloatBE`, `writeFloatLE` (4 bytes)
- `writeDoubleBE`, `writeDoubleLE` (8 bytes)

---

## Reading data

All `read*` methods **advance** the internal read pointer (consume bytes).
If there aren’t enough readable bytes, they throw `ExtendedBufferRangeError('SIZE_OUT_OF_RANGE')`.

### Checking before reading

```ts
if (b.isReadable(4)) {
  const x = b.readUInt32BE();
}
```

### Read a native `Buffer` or another `ExtendedBuffer`

```ts
// Copy out as a native Buffer
const chunk: Buffer = b.readBuffer(10, true);

// Copy out as a new ExtendedBuffer (same capacity/capacityStep/nativeAllocSlow/nativeReallocSlow by default)
const eb: ExtendedBuffer = b.readBuffer(10);
```

### Strings

```ts
const s = b.readString(5, "utf8");
```

### Integers

Variable-width (size **1…6** bytes):

```ts
const a = b.readIntBE(3);
const u = b.readUIntLE(4);
```

Fixed-width helpers:

- `readInt8`, `readUInt8`
- `readInt16BE`, `readInt16LE`, `readUInt16BE`, `readUInt16LE`
- `readInt32BE`, `readInt32LE`, `readUInt32BE`, `readUInt32LE`

### Floating point

- `readFloatBE`, `readFloatLE`
- `readDoubleBE`, `readDoubleLE`

---

## Pointer control (peeking / rewinding)

### Save pointer, read, then restore (peek)

```ts
const p = b.pointer;
const header = b.readUInt16BE();

// decide what to do...
b.setPointer(p); // rewind back to before header
```

### Move relative to current position

```ts
b.offset(4);   // skip 4 bytes
b.offset(-2);  // go back 2 bytes (must stay within 0…length)
```

If you try to set the pointer outside `[0, length]`, it throws
`ExtendedBufferRangeError('POINTER_OUT_OF_RANGE')`.

---

## Transactions (atomic changes)

Sometimes you want to perform a **multi-step read/write** and either:

- **commit** everything if it succeeds, or
- **rollback** the buffer to the exact previous state if something fails.

`ExtendedBuffer.transaction()` wraps your code in a transaction:

```ts
const result = b.transaction(() => {
  // any reads/writes/offsets/etc.
  return 123;
});
```

Rules:

- If the callback **returns normally**, changes are kept (committed).
- If the callback **throws**, the buffer is restored (rolled back) and the error is re-thrown.
- Transactions are **re-entrant**: nested `transaction()` calls do not create extra snapshots.

What gets rolled back:

- stored payload bytes
- `pointer` (read pointer)
- internal start/end offsets and the original native `Buffer` (even if the buffer was reallocated during the callback)

### Example: "try parse" without consuming bytes

This is useful for protocols where you might receive partial data and want to retry later.

```ts
import { ExtendedBuffer } from 'extended-buffer';

function tryReadFrame(b: ExtendedBuffer): Buffer | null {
  try {
    return b.transaction(() => {
      // (1) read header
      const len = b.readUInt16BE();

      // (2) not enough bytes yet -> rollback and let the caller wait for more data
      if (!b.isReadable(len)) {
        throw new Error('INCOMPLETE_FRAME');
      }

      // (3) success -> commit
      return b.readBuffer(len, true);
    });
  } catch {
    return null;
  }
}
```

### Example: rollback on validation error

```ts
b.transaction(() => {
  const magic = b.readUInt32BE();
  if (magic !== 0xdeadbeef) {
    throw new Error('BAD_MAGIC');
  }

  const version = b.readUInt8();
  if (version !== 1) {
    throw new Error('UNSUPPORTED_VERSION');
  }
});
```

### Performance note

`transaction()` snapshots the **current payload** (it copies the stored bytes) before running the callback.
That makes rollbacks safe, but can be expensive for very large buffers. Use it for small/medium payloads,
or when the safety/ergonomics is worth the extra copy.

---

## Memory management

### Discard already-read data

If you continuously read from the buffer, you can drop the consumed prefix:

```ts
b.discardReadData();
```

This moves the internal start forward by the number of read bytes and resets `pointer` to `0`.

### Shrink free capacity (`gc()`)

```ts
b.gc();
```

`gc()` first discards read data, then may shrink the underlying native `Buffer`
when free space exceeds `capacityStep`.

### Reset everything

```ts
b.clean(); // alias for initExtendedBuffer()
```

---

## Errors

The library defines these error classes:

- `ExtendedBufferError`
- `ExtendedBufferTypeError`
- `ExtendedBufferRangeError`

Common error codes you may see:

- `SIZE_OUT_OF_RANGE`: reading more bytes than available
- `POINTER_OUT_OF_RANGE`: setting pointer outside `0…length`
- `INVALID_INTEGER_SIZE_VALUE_TYPE`: size is not a safe integer
- `INVALID_INTEGER_SIZE_VALUE_RANGE`: integer size not in `1…6`
- `INVALID_INSTANCE_STATE`: internal invariant check failed
- `VALUE_MUST_BE_AN_INTEGER`: value not a safe integer
- `VALUE_MUST_BE_AN_UNSIGNED_INTEGER`: value is not a safe integer or less than 0
- `EXCEEDING_MAXIMUM_BUFFER_SIZE`: allocation exceeds Node’s `kMaxLength` or `os.totalmem()`

---

## Caveats

### Prepending (`unshift`) after reading

`unshift=true` prepends bytes by moving the internal start pointer, but the read pointer is **not adjusted** automatically.
If you prepend after consuming bytes, you may get surprising results (e.g., some previously read bytes can become readable again, or newly prepended bytes may be skipped).

A safe pattern is:

```ts
b.discardReadData();
b.writeUInt16BE(123, true);
```

### `nodeGc()` is Node-specific

`nodeGc()` calls `global.gc()` if it exists. In Node.js it requires starting the process with `--expose-gc`.
In non-Node runtimes, `global` may not exist.

---

## Reference: full public API (names)

Properties:
- `length`, `capacity`, `pointer`, `nativeBufferView`

Core:
- `initExtendedBuffer()`, `assertInstanceState()`, `clean()`
- `nativePointer()`, `getWritableSizeStart()`, `getWritableSizeEnd()`, `getWritableSize()`, `getReadableSize()`
- `transaction(callback)`
- `allocStart(size)`, `allocEnd(size)`
- `writeNativeBuffer(buf, unshift?)`, `writeBuffer(bufOrEB, unshift?)`, `writeString(str, enc?, unshift?)`
- Pointer: `setPointer(p)`, `getPointer()`, `offset(n)`, `isReadable(size)`
- Maintenance: `discardReadData()`, `gc()`, `nodeGc()`

Numbers:
- Write: `writeIntBE/LE`, `writeUIntBE/LE`, `writeInt8`, `writeUInt8`,
  `writeInt16BE/LE`, `writeUInt16BE/LE`, `writeInt32BE/LE`, `writeUInt32BE/LE`,
  `writeFloatBE/LE`, `writeDoubleBE/LE`
- Read: `readBuffer`, `readString`,
  `readIntBE/LE`, `readUIntBE/LE`, `readInt8`, `readUInt8`,
  `readInt16BE/LE`, `readUInt16BE/LE`, `readInt32BE/LE`, `readUInt32BE/LE`,
  `readFloatBE/LE`, `readDoubleBE/LE`
