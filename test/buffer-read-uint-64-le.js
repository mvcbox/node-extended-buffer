const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer.readUInt64LE()', function () {
    it('Test #1', function() {
        expect((new ExtendedBuffer).writeUInt64LE(100).readUInt64LE()).to.equal(100);
    });

    it('Test #2', function() {
        expect((new ExtendedBuffer).writeUInt64LE(200).readUInt64LE()).to.equal(200);
    });
});
