import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';
import { InMemorySigner } from '@taquito/signer';
import * as bs58check from 'bs58check';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
globalThis.Buffer = require('buffer/').Buffer;

const fromHexString = (hexString: string): Uint8Array => {
  const matches = hexString.match(/.{1,2}/gu);
  if (!matches) {
    return new Uint8Array();
  }
  return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)));
};

type TezosSnapRpcMethods =
  | 'tezos_getAccount'
  | 'tezos_sendOperation'
  | 'tezos_signPayload';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const { method, params } = request;
  const typedMethod: TezosSnapRpcMethods = method as any;

  const getWallet = async (
    prompt: string,
    description: string,
    textAreaContent: string,
  ) => {
    const result = await snap.request({
      method: 'snap_dialog',
      params: {
        type: 'confirmation',
        content: panel([
          heading(prompt),
          text(description),
          text(textAreaContent),
        ]),
      },
    });

    if (result) {
      const tezosNode = await snap.request({
        method: 'snap_getBip32Entropy',
        params: {
          // Must be specified exactly in the manifest
          path: ['m', "44'", "1729'", "0'", "0'"],
          curve: 'ed25519',
        },
      });
      return { ed25519: tezosNode };
    }
    return undefined;
  };

  const sign = async (payload: string, node: { ed25519: any }) => {
    const rawsk = node.ed25519.privateKey;
    const prefix = new Uint8Array([13, 15, 58, 7]);
    const arrayTwo = fromHexString(rawsk.slice(2));

    const mergedArray = new Uint8Array(prefix.length + arrayTwo.length);
    mergedArray.set(prefix);
    mergedArray.set(arrayTwo, prefix.length);

    const sk = bs58check.encode(mergedArray);

    const signer = new InMemorySigner(sk);

    const bytes = payload;
    const signature = await signer.sign(bytes);

    return {
      secretKey: sk,
      address: await signer.publicKeyHash(),
      signature,
    };
  };

  switch (typedMethod) {
    case 'tezos_getAccount':
      // eslint-disable-next-line no-case-declarations
      const tezosNode1 = await getWallet(
        'Tezos Account',
        '',
        `Do you want to allow ${origin} to access your Tezos public key?`,
      );

      return { result: tezosNode1 };

    case 'tezos_sendOperation':
      // eslint-disable-next-line no-case-declarations
      const tezosNode2 = await getWallet('', '', '');

      return { result: tezosNode2 };
    case 'tezos_signPayload':
      // eslint-disable-next-line no-case-declarations
      const { payload } = params as any;
      // eslint-disable-next-line no-case-declarations
      const tezosNode3 = await getWallet(
        'Sign Payload',
        '',
        `Do you want to sign the following payload?\n\n${JSON.stringify(
          payload,
          null,
          2,
        )}`,
      );

      if (!tezosNode3) {
        return '';
      }

      return sign(payload, tezosNode3);
    default:
      throw new Error('Method not found.');
  }
};
