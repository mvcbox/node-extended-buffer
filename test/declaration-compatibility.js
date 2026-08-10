"use strict";

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');

describe('Type declaration compatibility', function () {
  it('getGlobalContext(): should avoid version-specific NodeJS.Global references', function () {
    const declarationPath = path.join(__dirname, '..', 'dist', 'utils', 'get-global-context.d.ts');
    const declaration = fs.readFileSync(declarationPath, 'utf8');

    expect(declaration).to.not.include('NodeJS.Global');
    expect(declaration).to.not.include('typeof globalThis');
    expect(declaration).to.match(/type GlobalContext = typeof global\s*&\s*\{/);
    expect(declaration).to.include('gc?: () => void');
  });
});
