import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { tezosGetAccounts } from './methods/get-accounts';
import { tezosSendOperation } from './methods/send-operation';
import { tezosSignPayload } from './methods/sign-payload';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
globalThis.Buffer = require('buffer/').Buffer;

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
