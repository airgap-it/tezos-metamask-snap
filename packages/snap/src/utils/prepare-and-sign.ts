import { injectTransaction } from '../tezos/inject-transaction';
import { prepareOperations } from '../tezos/prepare-operations';
import { getSigner } from './get-signer';
import { sign } from './sign';

export const prepareAndSign = async (
  operations: any[],
  node: { ed25519: any },
  rpcUrl: string,
) => {
  const operationWatermark = new Uint8Array([3]);

  const signer = await getSigner(node);

  const forged = await prepareOperations(
    await signer.publicKeyHash(),
    await signer.publicKey(),
    operations,
    rpcUrl,
  );

  const signed = await sign(forged, operationWatermark, node);

  return injectTransaction(signed.signature.sbytes, rpcUrl);
};
