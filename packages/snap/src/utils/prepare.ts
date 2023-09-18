import { prepareOperations } from '../tezos/prepare-operations';
import { getSigner } from './get-signer';

export const prepare = async (
  operations: any[],
  node: { ed25519: any },
  nodeUrl: string,
) => {
  const signer = await getSigner(node);

  return prepareOperations(
    await signer.publicKeyHash(),
    await signer.publicKey(),
    operations,
    nodeUrl,
  );
};
