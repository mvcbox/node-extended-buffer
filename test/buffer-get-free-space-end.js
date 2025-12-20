"use strict";
const expect  = require('chai').expect;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('buffer.getWritableSizeEnd()', function () {
    it('Empty buffer', function() {
        let buffer = new ExtendedBuffer({
            nativeBufferLength: 10
        });
        expect(buffer.getWritableSizeEnd()).to.equal(5);
    });

    it('Write 1 byte to end', function() {
        let buffer = new ExtendedBuffer({
            nativeBufferLength: 10
        });
        buffer.writeUInt8(1);
        expect(buffer.getWritableSizeEnd()).to.equal(4);
    });

    it('Write 5 bytes to end', function() {
        let buffer = new ExtendedBuffer({
            nativeBufferLength: 10
        });
        buffer.writeUInt8(1).writeUInt32BE(1);
        expect(buffer.getWritableSizeEnd()).to.equal(0);
    });

    it('Write 1 byte to start', function() {
        let buffer = new ExtendedBuffer({
            nativeBufferLength: 10
        });
        buffer.writeUInt8(1, true);
        expect(buffer.getWritableSizeEnd()).to.equal(5);
    });
});
