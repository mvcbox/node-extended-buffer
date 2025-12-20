"use strict";
const expect  = require('chai').expect;
const ExtendedBuffer = require('..').ExtendedBuffer;

describe('ExtendedBuffer.maxNativeBufferLength', function () {
    it('ExtendedBuffer.maxNativeBufferLength equal require(\'buffer\').kMaxLength', function() {
        expect(ExtendedBuffer.maxNativeBufferLength).to.equal(require('buffer').kMaxLength);
    });
});
