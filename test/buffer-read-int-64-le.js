const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer.readInt64LE()', function () {
    it('Test #1', function() {
        expect((new ExtendedBuffer).writeInt64LE(100).readInt64LE()).to.equal(100);
    });

    it('Test #2', function() {
        expect((new ExtendedBuffer).writeInt64LE(-100).readInt64LE()).to.equal(-100);
    });
});
