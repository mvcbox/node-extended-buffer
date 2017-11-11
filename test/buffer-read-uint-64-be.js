const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer.readUInt64BE()', function () {
    it('Test #1', function() {
        expect((new ExtendedBuffer).writeUInt64BE(100).readUInt64BE()).to.equal(100);
    });

    it('Test #2', function() {
        expect((new ExtendedBuffer).writeUInt64BE(200).readUInt64BE()).to.equal(200);
    });
});
