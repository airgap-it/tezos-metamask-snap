import BigNumber from 'bignumber.js';
import { TezosOperation, TezosOperationType } from './types';

export const createRevealOperation = async (
  counter: BigNumber,
  publicKey: string,
  address: string,
  fee: string = new BigNumber('1300').toFixed(),
): Promise<TezosOperation> => {
  const operation = {
    kind: TezosOperationType.REVEAL,
    fee,
    gas_limit: '10000',
    storage_limit: '0',
    counter: counter.toFixed(),
    public_key: publicKey,
    source: address,
  };

  return operation;
};
