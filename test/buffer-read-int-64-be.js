const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer.readInt64BE()', function () {
    it('Test #1', function() {
        expect((new ExtendedBuffer).writeInt64BE(100).readInt64BE()).to.equal(100);
    });

    it('Test #2', function() {
        expect((new ExtendedBuffer).writeInt64BE(-100).readInt64BE()).to.equal(-100);
    });
});