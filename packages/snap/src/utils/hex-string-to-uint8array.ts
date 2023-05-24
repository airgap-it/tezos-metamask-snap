export const hexStringToUInt8Array = (hexString: string): Uint8Array => {
  if (hexString.length % 2 !== 0) {
    throw new Error('Hex String has invalid length');
  }

  const arrayBuffer = new Uint8Array(hexString.length / 2);

  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.substr(i, 2), 16);
    if (isNaN(byteValue)) {
      throw new Error('Hex String has invalid character');
    }
    arrayBuffer[i / 2] = byteValue;
  }

  return arrayBuffer;
};
