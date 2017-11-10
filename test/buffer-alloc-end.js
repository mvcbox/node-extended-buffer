const expect  = require('chai').expect;
const ExtendedBuffer = require('../src/extended-buffer');

describe('buffer.allocEnd()', function () {
    it('Alloc 1 byte', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 10
        });
        buffer.allocEnd(1);
        expect(buffer.getFreeSpaceEnd()).to.equal(5);
    });

    it('Alloc 5 bytes', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 10
        });
        buffer.allocEnd(5);
        expect(buffer.getFreeSpaceEnd()).to.equal(5);
    });

    it('Alloc 10 bytes', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 10
        });
        buffer.allocEnd(10);
        expect(buffer.getFreeSpaceEnd()).to.equal(10);
    });
});
