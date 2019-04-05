const expect  = require('chai').expect;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('buffer.getPointer()', function () {
    it('Test #1', function() {
        let buffer = new ExtendedBuffer;
        buffer._pointer = 123;
        expect(buffer.getPointer()).to.equal(123);
    });
});
