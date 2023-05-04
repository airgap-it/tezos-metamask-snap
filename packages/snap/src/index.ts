import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { InMemorySigner } from '@taquito/signer';
import * as bs58check from 'bs58check';
import {
  broadcastTransaction,
  prepareOperations,
} from './tezos/prepare-operations';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
globalThis.Buffer = require('buffer/').Buffer;

const fromHexString = (hexString: string): Uint8Array => {
  const matches = hexString.match(/.{1,2}/gu);
  if (!matches) {
    return new Uint8Array();
  }
  return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)));
};

const getSigner = async (node: { ed25519: any }) => {
  const rawsk = node.ed25519.privateKey;
  const edskPrefix = new Uint8Array([13, 15, 58, 7]);
  const arrayTwo = fromHexString(rawsk.slice(2));

  const mergedArray = new Uint8Array(edskPrefix.length + arrayTwo.length);
  mergedArray.set(edskPrefix);
  mergedArray.set(arrayTwo, edskPrefix.length);

  const sk = bs58check.encode(mergedArray);

  return new InMemorySigner(sk);
};

const sign = async (
  payload: string,
  watermark: Uint8Array | undefined,
  node: { ed25519: any },
) => {
  const signer = await getSigner(node);

  const bytes = payload;

  const signature = await signer.sign(bytes, watermark);

  return {
    signature,
  };
};

const getWallet = async () => {
  const tezosNode = await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      path: ['m', "44'", "1729'", "0'", "0'"],
      curve: 'ed25519',
    },
  });

  return { ed25519: tezosNode };
};

const prepareAndSign = async (operation: any[], node: { ed25519: any }) => {
  const operationWatermark = new Uint8Array([3]);

  const signer = await getSigner(node);

  const forged = await prepareOperations(
    await signer.publicKeyHash(),
    node.ed25519.publicKey.slice(4),
    operation,
  );

  const signed = await sign(forged, operationWatermark, node);

  return await broadcastTransaction(signed.signature.sbytes);
};

type TezosSnapRpcMethods =
  | 'tezos_getAccount'
  | 'tezos_sendOperation'
  | 'tezos_signPayload';

const tezosGetAccounts = async (origin: string) => {
  const wallet = await getWallet();
  const signer = await getSigner(wallet);

  const approved = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Tezos Account'),
        text(
          `Do you want to allow ${origin} to access your Tezos public key and address?`,
        ),
        copyable(await signer.publicKey()),
        divider(),
        copyable(await signer.publicKeyHash()),
      ]),
    },
  });

  console.log('approved', approved);

  return {
    curve: 'ed25519',
    publicKey: await signer.publicKey(),
    address: await signer.publicKeyHash(),
  };
};

const tezosSendOperation = async (params: any) => {
  const { payload } = params as any;
  const wallet = await getWallet();

  const approved = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Sign Operation'),
        text('Do you want to sign the following payload?'),
        copyable(JSON.stringify(payload, null, 2)),
      ]),
    },
  });

  console.log('approved', approved);

  if (!wallet) {
    return '';
  }

  return { opHash: await prepareAndSign(payload, wallet) };
};

const tezosSignPayload = async (params: any) => {
  const { payload } = params as any;
  const wallet = await getWallet();

  const approved = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Sign Payload'),
        text('Do you want to sign the following payload?'),
        copyable(JSON.stringify(payload)),
      ]),
    },
  });

  console.log('approved', approved);

  if (!wallet) {
    return '';
  }

  return sign(payload, undefined, wallet);
};

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
  console.log(origin);
  const { method, params } = request;
  const typedMethod: TezosSnapRpcMethods = method as any;

  switch (typedMethod) {
    case 'tezos_getAccount':
      return tezosGetAccounts(origin);

    case 'tezos_sendOperation':
      return tezosSendOperation(params);

    case 'tezos_signPayload':
      return tezosSignPayload(params);

    default:
      throw new Error('Method not found.');
  }
};
