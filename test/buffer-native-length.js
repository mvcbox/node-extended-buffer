const expect  = require('chai').expect;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('buffer.nativeLength', function () {
    it('Test #1', function() {
        let buffer = new ExtendedBuffer;
        expect(buffer.nativeLength).to.equal(ExtendedBuffer.maxSize);
    });

    it('Test #2', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 1000
        });
        expect(buffer.nativeLength).to.equal(1000);
    });
});
