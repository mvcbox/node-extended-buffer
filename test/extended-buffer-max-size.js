const expect  = require('chai').expect;
const ExtendedBuffer = require('../index');

describe('ExtendedBuffer.getMaxSize()', function () {
    it('ExtendedBuffer.getMaxSize() equal require(\'buffer\').kMaxLength', function() {
        expect(ExtendedBuffer.maxSize).to.equal(require('buffer').kMaxLength);
    });
});
