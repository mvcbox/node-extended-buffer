"use strict";

const expect = require('chai').expect;
const path = require('path');
const Module = require('module');
const Buffer = require('buffer').Buffer;

const {
  ExtendedBuffer,
  ExtendedBufferError,
  ExtendedBufferRangeError,
  ExtendedBufferTypeError,
  ExtendedBufferUnsupportedError,
} = require('..');

function requireFresh(modulePath) {
  delete require.cache[require.resolve(modulePath)];
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(modulePath);
}

describe('Coverage: Missing Branches', function () {
  it('ExtendedBuffer: should throw on invalid *Common read methods', function () {
    const buffer1 = new ExtendedBuffer().writeUInt8(1);
    expect(() => buffer1.readIntCommon('INVALID', 1))
      .to.throw(ExtendedBufferError)
      .with.property('message', 'INVALID_INT_READ_METHOD');

    // Use unsafeMode to bypass BigInt support asserts on old Node.js versions.
    const buffer2 = new ExtendedBuffer({ unsafeMode: true }).writeNativeBuffer(Buffer.alloc(8));
    expect(() => buffer2.readBigInt64Common('INVALID'))
      .to.throw(ExtendedBufferError)
      .with.property('message', 'INVALID_BIGINT_READ_METHOD');

    const buffer3 = new ExtendedBuffer().writeNativeBuffer(Buffer.alloc(4));
    expect(() => buffer3.readFloatingPointCommon('INVALID', 4))
      .to.throw(ExtendedBufferError)
      .with.property('message', 'INVALID_FLOATING_POINT_READ_METHOD');
  });

  it('ExtendedBuffer: should throw on invalid *Common write methods', function () {
    const buffer = new ExtendedBuffer();
    const unsafeBuffer = new ExtendedBuffer({ unsafeMode: true });

    // unshift=true branch
    expect(() => buffer.writeIntCommon('INVALID', 1, 1, false, true))
      .to.throw(ExtendedBufferError)
      .with.property('message', 'INVALID_INT_WRITE_METHOD');

    // unshift=false branch
    expect(() => buffer.writeIntCommon('INVALID', 1, 1, false, false))
      .to.throw(ExtendedBufferError)
      .with.property('message', 'INVALID_INT_WRITE_METHOD');

    // BigInt writes
    expect(() => unsafeBuffer.writeBigInt64Common('INVALID', 0, false, true))
      .to.throw(ExtendedBufferError)
      .with.property('message', 'INVALID_BIGINT_WRITE_METHOD');

    expect(() => unsafeBuffer.writeBigInt64Common('INVALID', 0, false, false))
      .to.throw(ExtendedBufferError)
      .with.property('message', 'INVALID_BIGINT_WRITE_METHOD');

    // Floating point writes
    expect(() => buffer.writeFloatingPointCommon('INVALID', 1.5, 4, true))
      .to.throw(ExtendedBufferError)
      .with.property('message', 'INVALID_FLOATING_POINT_WRITE_METHOD');

    expect(() => buffer.writeFloatingPointCommon('INVALID', 1.5, 4, false))
      .to.throw(ExtendedBufferError)
      .with.property('message', 'INVALID_FLOATING_POINT_WRITE_METHOD');
  });

  it('Unsafe mode: should skip asserts inside ExtendedBuffer', function () {
    const buffer = new ExtendedBuffer({ unsafeMode: true });

    // Smoke test for multiple paths guarded by `if (!this._unsafeMode)`.
    buffer.allocStart(0);
    buffer.allocEnd(0);
    buffer.setPointer(0);
    buffer.offset(0);
    expect(buffer.isReadable(0)).to.equal(true);

    buffer.writeUInt8(1);
    expect(buffer.readUInt8()).to.equal(1);

    buffer.writeFloatLE(1.25);
    expect(buffer.readFloatLE()).to.equal(1.25);

    // BigInt is not available on Node.js 6, and Buffer BigInt methods are also missing there.
    if (typeof BigInt === 'function' && typeof Buffer.prototype.writeBigInt64LE === 'function') {
      const value = BigInt(7);
      buffer.writeBigInt64LE(value);
      expect(buffer.readBigInt64LE()).to.equal(value);
    }

    buffer.writeString('abc', 'utf8');
    expect(buffer.readString(3, 'utf8')).to.equal('abc');

    const view = buffer.bufferView;
    expect(view).to.be.instanceOf(ExtendedBuffer);
    expect(view._unsafeMode).to.equal(true);
  });

  it('ExtendedBuffer: should cover nodeGc()/setUnsafeMode()/offset()/isReadable() in safe mode', function () {
    const buffer = new ExtendedBuffer();

    buffer.setUnsafeMode(false);
    buffer.offset(0);
    expect(buffer.isReadable(0)).to.equal(true);

    buffer.setUnsafeMode(true);
    expect(buffer._unsafeMode).to.equal(true);
    buffer.setUnsafeMode(false);

    const root = typeof globalThis !== 'undefined' ? globalThis : global;
    const originalGc = root.gc;
    let calls = 0;

    try {
      root.gc = function () {
        calls += 1;
      };
      buffer.nodeGc();
      expect(calls).to.equal(1);
    } finally {
      if (originalGc === undefined) {
        delete root.gc;
      } else {
        root.gc = originalGc;
      }
    }
  });

  it('utils.getGlobalContext(): should use fallbacks (self/window/global/Function)', function () {
    const { getGlobalContext } = require('../dist/utils/get-global-context');

    const root = typeof globalThis !== 'undefined' ? globalThis : global;

    const hasGlobalThis = Object.prototype.hasOwnProperty.call(root, 'globalThis');
    const hasGlobal = Object.prototype.hasOwnProperty.call(root, 'global');
    const hasSelf = Object.prototype.hasOwnProperty.call(root, 'self');
    const hasWindow = Object.prototype.hasOwnProperty.call(root, 'window');

    const originalGlobalThis = root.globalThis;
    const originalGlobal = root.global;
    const originalSelf = root.self;
    const originalWindow = root.window;
    const originalFunction = root.Function;

    try {
      // self
      root.globalThis = undefined;
      root.self = { from: 'self' };
      expect(getGlobalContext()).to.equal(root.self);

      // window
      delete root.self;
      root.window = { from: 'window' };
      expect(getGlobalContext()).to.equal(root.window);

      // global
      delete root.window;
      expect(getGlobalContext()).to.equal(root);

      // Function('return this')()
      root.global = undefined;
      expect(getGlobalContext()).to.equal(root);

      // Function blocked -> undefined
      root.Function = function () {
        throw new Error('blocked');
      };
      expect(getGlobalContext()).to.equal(undefined);
    } finally {
      if (!hasGlobalThis) {
        delete root.globalThis;
      } else {
        root.globalThis = originalGlobalThis;
      }

      if (!hasGlobal) {
        delete root.global;
      } else {
        root.global = originalGlobal;
      }

      if (!hasSelf) {
        delete root.self;
      } else {
        root.self = originalSelf;
      }

      if (!hasWindow) {
        delete root.window;
      } else {
        root.window = originalWindow;
      }

      root.Function = originalFunction;
    }
  });

  it('utils.nativeBufferSubarray(): should use slice fallback when Buffer.subarray is not a Buffer', function () {
    const modPath = path.join(__dirname, '..', 'dist', 'utils', 'native-buffer-subarray.js');

    const originalAllocUnsafe = Buffer.allocUnsafe;
    try {
      // Force sliceFallback=true at module load time.
      Buffer.allocUnsafe = function (size) {
        const buf = originalAllocUnsafe(size);

        // `native-buffer-subarray` checks only `Buffer.allocUnsafe(1).subarray(0) instanceof Buffer`.
        // Patch only that case to avoid breaking Node internals (fs/module loader).
        if (size === 1) {
          buf.subarray = function (begin, end) {
            const ua = new Uint8Array(this.buffer, this.byteOffset, this.byteLength);
            return ua.subarray(begin, end);
          };
        }

        return buf;
      };

      const { nativeBufferSubarray } = requireFresh(modPath);
      const buf = Buffer.from([1, 2, 3, 4]);
      const view = nativeBufferSubarray(buf, 1, 3);

      expect(Buffer.isBuffer(view)).to.equal(true);
      expect(Array.prototype.slice.call(view)).to.deep.equal([2, 3]);
    } finally {
      Buffer.allocUnsafe = originalAllocUnsafe;
      delete require.cache[require.resolve(modPath)];
    }
  });

  it('errors.ExtendedBufferError: should work without Error.captureStackTrace', function () {
    const originalCaptureStackTrace = Error.captureStackTrace;
    try {
      Error.captureStackTrace = undefined;

      const err = new ExtendedBufferError('TEST');
      expect(err).to.be.instanceOf(Error);
      expect(err).to.be.instanceOf(ExtendedBufferError);
      expect(err.name).to.equal('ExtendedBufferError');
    } finally {
      Error.captureStackTrace = originalCaptureStackTrace;
    }
  });

  it('utils.assertBigInteger/assertUnsignedBigInteger: should throw on invalid values', function () {
    const { assertBigInteger } = require('../dist/utils/assert-big-integer');
    const { assertUnsignedBigInteger } = require('../dist/utils/assert-unsigned-big-integer');

    expect(() => assertBigInteger(1)).to.throw(ExtendedBufferTypeError, 'VALUE_MUST_BE_A_BIG_INTEGER');
    expect(() => assertUnsignedBigInteger(1)).to.throw(ExtendedBufferTypeError, 'VALUE_MUST_BE_AN_UNSIGNED_BIG_INTEGER');

    if (typeof BigInt === 'function') {
      expect(() => assertUnsignedBigInteger(BigInt(-1))).to.throw(ExtendedBufferTypeError, 'VALUE_MUST_BE_AN_UNSIGNED_BIG_INTEGER');
    }
  });

  it('utils.assertSupportBigInteger: should throw when Buffer BigInt methods are missing', function () {
    const modPath = path.join(__dirname, '..', 'dist', 'utils', 'assert-support-big-integer.js');

    const proto = Buffer.prototype;
    const originalMethod = proto.readBigUInt64LE;

    try {
      proto.readBigUInt64LE = undefined;
      const { assertSupportBigInteger } = requireFresh(modPath);

      expect(() => assertSupportBigInteger())
        .to.throw(ExtendedBufferUnsupportedError)
        .with.property('message', 'EXECUTION_ENVIRONMENT_NOT_SUPPORT_BIG_INT');
    } finally {
      proto.readBigUInt64LE = originalMethod;
      delete require.cache[require.resolve(modPath)];
    }
  });

  it('utils.allocNativeBuffer: should handle os.totalmem variations', function () {
    const modPath = path.join(__dirname, '..', 'dist', 'utils', 'alloc-native-buffer.js');

    const originalLoad = Module._load;

    // Case 1: very small total memory -> should throw on exceeding.
    Module._load = function (request) {
      if (request === 'os') {
        return { totalmem: () => 16 };
      }
      return originalLoad.apply(this, arguments);
    };

    try {
      const { allocNativeBuffer } = requireFresh(modPath);
      expect(() => allocNativeBuffer(32)).to.throw(ExtendedBufferRangeError, 'EXCEEDING_MAXIMUM_BUFFER_SIZE');
    } finally {
      Module._load = originalLoad;
      delete require.cache[require.resolve(modPath)];
    }

    // Case 2: missing totalmem -> should not throw.
    Module._load = function (request) {
      if (request === 'os') {
        return {};
      }
      return originalLoad.apply(this, arguments);
    };

    try {
      const { allocNativeBuffer } = requireFresh(modPath);
      const buf = allocNativeBuffer(32);
      expect(buf).to.be.instanceOf(Buffer);
      expect(buf.length).to.equal(32);
    } finally {
      Module._load = originalLoad;
      delete require.cache[require.resolve(modPath)];
    }

    // Case 3: os require throws -> should still load module and allocate.
    let osLoadCalls = 0;
    Module._load = function (request) {
      if (request === 'os') {
        osLoadCalls += 1;
        throw new Error('boom');
      }
      return originalLoad.apply(this, arguments);
    };

    try {
      const { allocNativeBuffer } = requireFresh(modPath);
      expect(osLoadCalls).to.equal(1);

      const buf = allocNativeBuffer(8);
      expect(buf).to.be.instanceOf(Buffer);
      expect(buf.length).to.equal(8);
    } finally {
      Module._load = originalLoad;
      delete require.cache[require.resolve(modPath)];
    }
  });

  it('dist/index.js: should cover TS helper fallbacks', function () {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.js');
    const utilsExports = require('../dist/utils');

    // Make sure __createBinding hits the branch that uses `Object.defineProperty` and getter descriptor.
    utilsExports.__coverage_helper_value = 123;
    try {
      const entry = requireFresh(indexPath);
      expect(entry.__coverage_helper_value).to.equal(123);
    } finally {
      delete utilsExports.__coverage_helper_value;
      delete require.cache[require.resolve(indexPath)];
    }

    // Make sure __createBinding hits the fallback branch when Object.create is missing.
    const originalObjectCreate = Object.create;
    utilsExports.__coverage_helper_value = 456;

    try {
      Object.create = undefined;
      const entry = requireFresh(indexPath);
      Object.create = originalObjectCreate;

      expect(entry.__coverage_helper_value).to.equal(456);
    } finally {
      Object.create = originalObjectCreate;
      delete utilsExports.__coverage_helper_value;
      delete require.cache[require.resolve(indexPath)];
    }
  });

  it('dist/ExtendedBuffer.js: should cover __importStar fallback path', function () {
    const extPath = path.join(__dirname, '..', 'dist', 'ExtendedBuffer.js');
    const utilsExports = require('../dist/utils');

    // Build a plain object without `__esModule` to trigger __importStar fallback logic.
    // Note: `__esModule` is non-enumerable, so it won't be copied by Object.assign.
    const fakeUtils = Object.assign({}, utilsExports);

    const originalLoad = Module._load;
    Module._load = function (request, parent) {
      if (request === './utils' && parent && parent.filename === extPath) {
        return fakeUtils;
      }
      return originalLoad.apply(this, arguments);
    };

    try {
      const { ExtendedBuffer: ExtendedBufferFromFile } = requireFresh(extPath);
      const buf = new ExtendedBufferFromFile();
      buf.writeUInt8(1);
      expect(buf.readUInt8()).to.equal(1);
    } finally {
      Module._load = originalLoad;
      delete require.cache[require.resolve(extPath)];
    }
  });
});
