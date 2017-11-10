const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer.writeInt64LE()', function () {
    it('Test #1', function() {
        let buf1 = (new ExtendedBuffer).writeInt64LE(1000).writeInt64LE(2000);
        let buf2 = Buffer.alloc(16);
        buf2.writeIntLE(1000, 0, 8);
        buf2.writeIntLE(2000, 8, 8);
        expect(Buffer.compare(buf1.buffer, buf2)).to.equal(0);
    });

    it('Test #2', function() {
        let buf1 = (new ExtendedBuffer).writeInt64LE(1000).writeInt64LE(2000, true);
        let buf2 = Buffer.alloc(16);
        buf2.writeIntLE(2000, 0, 8);
        buf2.writeIntLE(1000, 8, 8);
        expect(Buffer.compare(buf1.buffer, buf2)).to.equal(0);
    });
});
