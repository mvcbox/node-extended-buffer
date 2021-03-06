const expect  = require('chai').expect;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('buffer.writeUInt16BE()', function () {
    it('Test #1', function() {
        let buf1 = (new ExtendedBuffer).writeUInt16BE(1000).writeUInt16BE(2000);
        let buf2 = Buffer.alloc(4);
        buf2.writeUInt16BE(1000, 0);
        buf2.writeUInt16BE(2000, 2);
        expect(Buffer.compare(buf1.buffer, buf2)).to.equal(0);
    });

    it('Test #2', function() {
        let buf1 = (new ExtendedBuffer).writeUInt16BE(1000).writeUInt16BE(2000, true);
        let buf2 = Buffer.alloc(4);
        buf2.writeUInt16BE(2000, 0);
        buf2.writeUInt16BE(1000, 2);
        expect(Buffer.compare(buf1.buffer, buf2)).to.equal(0);
    });
});
