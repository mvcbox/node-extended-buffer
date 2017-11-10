const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer.allocStart()', function () {
    it('Alloc 1 byte', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 10
        });
        buffer.allocStart(1);
        expect(buffer.getFreeSpaceStart()).to.equal(5);
    });

    it('Alloc 5 bytes', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 10
        });
        buffer.allocStart(5);
        expect(buffer.getFreeSpaceStart()).to.equal(5);
    });

    it('Alloc 10 bytes', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 10
        });
        buffer.allocStart(10);
        expect(buffer.getFreeSpaceStart()).to.equal(10);
    });
});
