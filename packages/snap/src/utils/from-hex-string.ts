export const fromHexString = (hexString: string): Uint8Array => {
  const matches = hexString.match(/.{1,2}/gu);
  if (!matches) {
    return new Uint8Array();
  }
  return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)));
};
