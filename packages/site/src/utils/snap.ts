import { Buffer } from 'buffer';
import * as bs58check from 'bs58check';
import { hash } from '@stablelib/blake2b';

import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

export async function getAddressFromPublicKey(
  publicKey: string,
): Promise<string> {
  const prefixes = {
    // tz1...
    edpk: {
      length: 54,
      prefix: Buffer.from(new Uint8Array([6, 161, 159])),
    },
    // tz2...
    sppk: {
      length: 55,
      prefix: Buffer.from(new Uint8Array([6, 161, 161])),
    },
    // tz3...
    p2pk: {
      length: 55,
      prefix: Buffer.from(new Uint8Array([6, 161, 164])),
    },
  };

  let prefix: Buffer | undefined;
  let plainPublicKey: string | undefined;
  if (publicKey.length === 64) {
    prefix = prefixes.edpk.prefix;
    plainPublicKey = publicKey;
  } else {
    const entries = Object.entries(prefixes);
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < entries.length; index++) {
      const [key, value] = entries[index];
      if (publicKey.startsWith(key) && publicKey.length === value.length) {
        prefix = value.prefix;
        const decoded = bs58check.decode(publicKey);
        plainPublicKey = decoded
          .slice(key.length, decoded.length)
          .toString('hex');
        break;
      }
    }
  }

  if (!prefix || !plainPublicKey) {
    throw new Error(`invalid publicKey: ${publicKey}`);
  }

  const payload: Uint8Array = hash(Buffer.from(plainPublicKey, 'hex'), 20);

  return bs58check.encode(Buffer.concat([prefix, Buffer.from(payload)]));
}

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

export const sendGetAccount = async () => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'tezos_getAccount',
      },
    },
  });

  console.log('tezos_getAccount', result);

  const pubkey: string = (result as any)?.test?.publicKey;

  const address: string = await getAddressFromPublicKey(pubkey.slice(4));

  return address;
};

export const sendOperationRequest = async () => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'tezos_sendOperation',
        params: {
          payload: 'test',
        },
      },
    },
  });

  console.log('tezos_sendOperation', result);

  return (result as any).signature.prefixSig;
};

export const sendSignRequest = async () => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'tezos_signPayload',
        params: {
          payload:
            '05010000004254657a6f73205369676e6564204d6573736167653a206d79646170702e636f6d20323032312d30312d31345431353a31363a30345a2048656c6c6f20776f726c6421',
        },
      },
    },
  });

  console.log('tezos_signPayload', result);

  return (result as any).signature.prefixSig;
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
