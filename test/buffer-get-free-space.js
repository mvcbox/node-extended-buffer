"use strict";
const expect  = require('chai').expect;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('buffer.getWritableSize()', function () {
    it('Empty buffer', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 10
        });
        expect(buffer.getWritableSize()).to.equal(10);
    });

    it('Write 1 byte', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 10
        });
        buffer.writeUInt8(1);
        expect(buffer.getWritableSize()).to.equal(9);
    });

    it('Write 10 bytes', function() {
        let buffer = new ExtendedBuffer({
            maxBufferLength: 10
        });
        buffer.writeUInt32BE(1).writeUInt32BE(1).writeUInt16BE(1);
        expect(buffer.getWritableSize()).to.equal(0);
    });
});
