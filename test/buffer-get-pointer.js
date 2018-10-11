const expect  = require('chai').expect;
const ExtendedBuffer = require('../index');

describe('buffer.getPointer()', function () {
    it('Test #1', function() {
        let buffer = new ExtendedBuffer;
        buffer._pointer = 123;
        expect(buffer.getPointer()).to.equal(123);
    });
});
