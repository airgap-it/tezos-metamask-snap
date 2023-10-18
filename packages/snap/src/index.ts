import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { tezosGetAccount } from './rpc-methods/get-account';
import { tezosSendOperation } from './rpc-methods/send-operation';
import { tezosSignPayload } from './rpc-methods/sign-payload';
import { tezosGetRpc } from './rpc-methods/get-rpc';
import { tezosSetRpc } from './rpc-methods/set-rpc';
import { tezosClearRpc } from './rpc-methods/clear-rpc';
import { METHOD_NOT_FOUND_ERROR } from './utils/errors';
import { ReturnWrapper } from './types';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
globalThis.Buffer = require('buffer/').Buffer;

type TezosSnapRpcMethods =
  | 'tezos_getAccount'
  | 'tezos_sendOperation'
  | 'tezos_signPayload'
  | 'tezos_getRpc'
  | 'tezos_setRpc'
  | 'tezos_clearRpc';

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
}): ReturnWrapper<any> => {
  const { method, params } = request;
  const typedMethod = method as TezosSnapRpcMethods;

  switch (typedMethod) {
    case 'tezos_getAccount':
      return tezosGetAccount(origin);

    case 'tezos_sendOperation':
      return tezosSendOperation(origin, params as any);

    case 'tezos_signPayload':
      return tezosSignPayload(origin, params as any);

    case 'tezos_getRpc':
      return tezosGetRpc(origin);

    case 'tezos_setRpc':
      return tezosSetRpc(origin, params as any);

    case 'tezos_clearRpc':
      return tezosClearRpc(origin);

    default:
      throw METHOD_NOT_FOUND_ERROR();
  }
};
