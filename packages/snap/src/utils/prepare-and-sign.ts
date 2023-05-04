import {
  broadcastTransaction,
  prepareOperations,
} from '../tezos/prepare-operations';
import { getSigner } from './get-signer';
import { sign } from './sign';

export const prepareAndSign = async (
  operation: any[],
  node: { ed25519: any },
) => {
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
