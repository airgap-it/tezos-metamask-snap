import { prepareOperations } from '../tezos/prepare-operations';
import { TezosOperation } from '../tezos/types';
import { getSigner } from './get-signer';

export const prepare = async (
  operations: TezosOperation[],
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
