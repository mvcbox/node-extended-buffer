const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer._writeNativeBuffer()', function () {
    it('Test #1', function() {
        let buf1 = (new ExtendedBuffer)._writeNativeBuffer(Buffer.from([3, 2, 1]));
        let buf2 = Buffer.from([3, 2, 1]);
        expect(Buffer.compare(buf1.buffer, buf2)).to.equal(0);
    });
});
