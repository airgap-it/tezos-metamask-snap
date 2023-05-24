import chai, { expect } from 'chai';
import chaiBytes from 'chai-bytes';
import { hexStringToUInt8Array } from './hex-string-to-uint8array';

chai.use(chaiBytes);

describe('Test function: hexStringToUInt8Array', function () {
  it('should convert hex string to UInt8Array', async function () {
    expect(hexStringToUInt8Array('00')).to.equalBytes(new Uint8Array([0]));
    expect(hexStringToUInt8Array('0f')).to.equalBytes(new Uint8Array([15]));
    expect(hexStringToUInt8Array('12')).to.equalBytes(new Uint8Array([18]));
    expect(hexStringToUInt8Array('0022')).to.equalBytes(
      new Uint8Array([0, 34]),
    );
    expect(hexStringToUInt8Array('a7b9ff5722429d')).to.equalBytes(
      new Uint8Array([167, 185, 255, 87, 34, 66, 157]),
    );
  });

  it('should throw an error on invalid length', async function () {
    expect(() => hexStringToUInt8Array('000')).to.throw(
      'Hex String has invalid length',
    );
  });

  it('should throw an error for a non-hex string', () => {
    expect(() => hexStringToUInt8Array('xy')).to.throw(
      'Hex String has invalid character',
    );
  });
});
