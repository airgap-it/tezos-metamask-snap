import { localForger } from '@taquito/local-forging';
import BigNumber from 'bignumber.js';
import {
  NETWORK_ERROR,
  PROPERTY_NOT_DEFINED_ERROR,
  PROPERTY_NOT_DEFINED_WITH_DATA_ERROR,
  UNSUPPORTED_OPERATION_KIND_ERROR,
} from '../utils/errors';
import { createRevealOperation } from './create-reveal-operation';
import {
  TezosOperationType,
  TezosTransactionOperation,
  TezosRevealOperation,
  TezosDelegationOperation,
  TezosOriginationOperation,
  TezosOperation,
} from './types';
import {
  ALLOCATION_STORAGE_LIMIT,
  DEFAULT_GAS_LIMIT,
  FEE_PLACEHOLDER,
  GAS_LIMIT_PLACEHOLDER,
  STORAGE_LIMIT_PLACEHOLDER,
} from './constants';
import { estimateAndReplaceLimitsAndFee } from './estimate-fee';
import { getBalanceOfAddress } from './get-balance-of-address';

export const handleRevealOperation = async (
  operationRequest: TezosOperation,
  address: string,
  defaultCounter: string,
  defaultFee: string,
  defaultGasLimit: string,
  defaultStorageLimit: string,
) => {
  const revealOperation: TezosRevealOperation =
    operationRequest as TezosRevealOperation;

  if (!revealOperation.public_key) {
    throw PROPERTY_NOT_DEFINED_ERROR('public_key');
  }

  revealOperation.source = revealOperation.source ?? address;
  revealOperation.counter = revealOperation.counter ?? defaultCounter;
  revealOperation.fee = revealOperation.fee ?? defaultFee;
  revealOperation.gas_limit = revealOperation.gas_limit ?? defaultGasLimit;

  revealOperation.storage_limit =
    revealOperation.storage_limit ?? defaultStorageLimit;

  return revealOperation;
};

export const handleDelegationOperation = async (
  operationRequest: TezosOperation,
  address: string,
  defaultCounter: string,
  defaultFee: string,
  defaultGasLimit: string,
  defaultStorageLimit: string,
) => {
  // eslint-disable-next-line no-case-declarations
  const delegationOperation: TezosDelegationOperation =
    operationRequest as TezosDelegationOperation;

  // The delegate property is optional, so we don't have any mandatory properties to check for

  delegationOperation.source = delegationOperation.source ?? address;
  delegationOperation.counter = delegationOperation.counter ?? defaultCounter;
  delegationOperation.fee = delegationOperation.fee ?? defaultFee;
  delegationOperation.gas_limit =
    delegationOperation.gas_limit ?? defaultGasLimit;

  delegationOperation.storage_limit =
    delegationOperation.storage_limit ?? defaultStorageLimit;

  return delegationOperation;
};

export const handleTransactionOperation = async (
  operationRequest: TezosOperation,
  address: string,
  defaultCounter: string,
  defaultFee: string,
) => {
  const transactionOperation: TezosTransactionOperation =
    operationRequest as TezosTransactionOperation;

  if (!transactionOperation.amount) {
    throw PROPERTY_NOT_DEFINED_ERROR('amount');
  }

  if (!transactionOperation.destination) {
    throw PROPERTY_NOT_DEFINED_ERROR('destination');
  }

  transactionOperation.source = transactionOperation.source ?? address;
  transactionOperation.counter = transactionOperation.counter ?? defaultCounter;
  transactionOperation.fee = transactionOperation.fee ?? defaultFee;
  transactionOperation.gas_limit =
    transactionOperation.gas_limit ?? GAS_LIMIT_PLACEHOLDER;

  transactionOperation.storage_limit =
    transactionOperation.storage_limit ?? STORAGE_LIMIT_PLACEHOLDER;

  return transactionOperation;
};

export const handleOriginationOperation = async (
  operationRequest: TezosOperation,
  address: string,
  defaultCounter: string,
  defaultFee: string,
) => {
  const originationOperation: TezosOriginationOperation =
    operationRequest as TezosOriginationOperation;

  if (!originationOperation.balance) {
    throw PROPERTY_NOT_DEFINED_ERROR('balance');
  }

  if (!originationOperation.script) {
    throw PROPERTY_NOT_DEFINED_ERROR('script');
  }

  originationOperation.source = originationOperation.source ?? address;
  originationOperation.counter = originationOperation.counter ?? defaultCounter;
  originationOperation.fee = originationOperation.fee ?? defaultFee;
  originationOperation.gas_limit =
    originationOperation.gas_limit ?? GAS_LIMIT_PLACEHOLDER;

  originationOperation.storage_limit =
    originationOperation.storage_limit ?? STORAGE_LIMIT_PLACEHOLDER;

  return originationOperation;
};

export const prepareOperations = async (
  address: string,
  publicKey: string,
  operationRequests: TezosOperation[],
  nodeUrl: string,
  overrideParameters = true,
): Promise<string> => {
  let counter: BigNumber = new BigNumber(1);
  const operations: TezosOperation[] = [];

  const results = await Promise.all(
    (
      await Promise.all([
        fetch(
          `${nodeUrl}chains/main/blocks/head/context/contracts/${address}/counter`,
        ),
        fetch(`${nodeUrl}chains/main/blocks/head~2/hash`),
        fetch(
          `${nodeUrl}chains/main/blocks/head/context/contracts/${address}/manager_key`,
        ),
      ]).catch((error) => {
        throw NETWORK_ERROR(error);
      })
    ).map((res) => res.json()),
  );

  counter = new BigNumber(results[0]).plus(1);
  const branch = results[1];

  const accountManager: { key: string } = results[2];

  const hasRevealInOperationRequests = operationRequests.some(
    (request: TezosOperation) => request.kind === TezosOperationType.REVEAL,
  );

  // check if we have revealed the address already
  if (!accountManager && !hasRevealInOperationRequests) {
    operations.push(await createRevealOperation(counter, publicKey, address));
    counter = counter.plus(1);
  }

  const operationPromises: Promise<TezosOperation>[] = operationRequests.map(
    async (operationRequest: TezosOperation, index: number) => {
      if (!operationRequest.kind) {
        throw PROPERTY_NOT_DEFINED_WITH_DATA_ERROR('kind', operationRequest);
      }

      const recipient: string | undefined = (
        operationRequest as TezosTransactionOperation
      ).destination;
      let receivingBalance: BigNumber | undefined;
      if (recipient?.toLowerCase().startsWith('tz')) {
        receivingBalance = new BigNumber(
          await getBalanceOfAddress(recipient, nodeUrl),
        );
      }

      const defaultCounter: string = counter.plus(index).toFixed();
      const defaultFee: string = FEE_PLACEHOLDER;
      const defaultGasLimit = DEFAULT_GAS_LIMIT;
      const defaultStorageLimit: string =
        receivingBalance?.isZero() &&
        recipient &&
        recipient.toLowerCase().startsWith('tz')
          ? ALLOCATION_STORAGE_LIMIT
          : '0'; // taken from eztz

      switch (operationRequest.kind) {
        case TezosOperationType.REVEAL:
          return handleRevealOperation(
            operationRequest,
            address,
            defaultCounter,
            defaultFee,
            defaultGasLimit,
            defaultStorageLimit,
          );

        case TezosOperationType.DELEGATION:
          return handleDelegationOperation(
            operationRequest,
            address,
            defaultCounter,
            defaultFee,
            defaultGasLimit,
            defaultStorageLimit,
          );

        case TezosOperationType.TRANSACTION:
          return handleTransactionOperation(
            operationRequest,
            address,
            defaultCounter,
            defaultFee,
          );

        case TezosOperationType.ORIGINATION:
          return handleOriginationOperation(
            operationRequest,
            address,
            defaultCounter,
            defaultFee,
          );

        case TezosOperationType.ENDORSEMENT:
        case TezosOperationType.SEED_NONCE_REVELATION:
        case TezosOperationType.DOUBLE_ENDORSEMENT_EVIDENCE:
        case TezosOperationType.DOUBLE_BAKING_EVIDENCE:
        case TezosOperationType.ACTIVATE_ACCOUNT:
        case TezosOperationType.PROPOSALS:
        case TezosOperationType.BALLOT:
          // Do not change anything
          return operationRequest;
        default:
          throw UNSUPPORTED_OPERATION_KIND_ERROR(operationRequest.kind);
      }
    },
  );

  operations.push(...(await Promise.all(operationPromises)));

  const wrappedOperation = {
    branch,
    contents: operations,
  };

  const estimated = await estimateAndReplaceLimitsAndFee(
    wrappedOperation,
    nodeUrl,
    overrideParameters,
  );

  return await localForger.forge(estimated as any);
};
