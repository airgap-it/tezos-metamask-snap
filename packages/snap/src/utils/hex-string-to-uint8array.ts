import {
  HEX_CHARACTER_INVALID_ERROR,
  HEX_LENGTH_INVALID_ERROR,
} from './errors';

export const hexStringToUInt8Array = (hexString: string): Uint8Array => {
  if (hexString.length % 2 !== 0) {
    throw HEX_LENGTH_INVALID_ERROR();
  }

  const arrayBuffer = new Uint8Array(hexString.length / 2);

  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.substring(i, i + 2), 16);
    if (isNaN(byteValue)) {
      throw HEX_CHARACTER_INVALID_ERROR();
    }
    arrayBuffer[i / 2] = byteValue;
  }

  return arrayBuffer;
};
