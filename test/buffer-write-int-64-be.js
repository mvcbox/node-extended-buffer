const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer.writeInt64BE()', function () {
    it('Test #1', function() {
        let buf1 = (new ExtendedBuffer).writeInt64BE(1000).writeInt64BE(2000);
        let buf2 = Buffer.alloc(16);
        buf2.writeIntBE(1000, 0, 8);
        buf2.writeIntBE(2000, 8, 8);
        expect(Buffer.compare(buf1.buffer, buf2)).to.equal(0);
    });

    it('Test #2', function() {
        let buf1 = (new ExtendedBuffer).writeInt64BE(1000).writeInt64BE(2000, true);
        let buf2 = Buffer.alloc(16);
        buf2.writeIntBE(2000, 0, 8);
        buf2.writeIntBE(1000, 8, 8);
        expect(Buffer.compare(buf1.buffer, buf2)).to.equal(0);
    });
});
