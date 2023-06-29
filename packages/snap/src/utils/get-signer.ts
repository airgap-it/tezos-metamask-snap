import { InMemorySigner } from '@taquito/signer';
import * as bs58check from 'bs58check';
import { hexStringToUInt8Array } from './hex-string-to-uint8array';

export const getSigner = async (node: { ed25519: any }) => {
  const rawsk = node.ed25519.privateKey;
  const edskPrefix = new Uint8Array([13, 15, 58, 7]);
  const arrayTwo = hexStringToUInt8Array(
    rawsk.slice(2) /* Slice away 0x from the beginning */,
  );

  const mergedArray = new Uint8Array(edskPrefix.length + arrayTwo.length);
  mergedArray.set(edskPrefix);
  mergedArray.set(arrayTwo, edskPrefix.length);

  const sk = bs58check.encode(mergedArray);

  return new InMemorySigner(sk);
};
