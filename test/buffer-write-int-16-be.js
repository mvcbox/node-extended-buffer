const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer.writeInt16BE()', function () {
    it('Test #1', function() {
        let buf1 = (new ExtendedBuffer).writeInt16BE(111).writeInt16BE(222);
        let buf2 = Buffer.alloc(4);
        buf2.writeInt16BE(111, 0);
        buf2.writeInt16BE(222, 2);
        expect(Buffer.compare(buf1.buffer, buf2)).to.equal(0);
    });

    it('Test #2', function() {
        let buf1 = (new ExtendedBuffer).writeInt16BE(111).writeInt16BE(222, true);
        let buf2 = Buffer.alloc(4);
        buf2.writeInt16BE(222, 0);
        buf2.writeInt16BE(111, 2);
        expect(Buffer.compare(buf1.buffer, buf2)).to.equal(0);
    });
});
