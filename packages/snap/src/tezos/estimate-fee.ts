import { localForger } from '@taquito/local-forging';
import BigNumber from 'bignumber.js';
import {
  TezosWrappedOperation,
  TezosOperationType,
  TezosTransactionOperation,
  TezosRevealOperation,
  TezosDelegationOperation,
  TezosOriginationOperation,
  RunOperationResponse,
  TezosOperation,
  RunOperationOperationResult,
  RunOperationInternalOperationResult,
  RunOperationMetadata,
} from './types';
import {
  MAX_GAS_PER_BLOCK,
  GAS_LIMIT_PLACEHOLDER,
  STORAGE_LIMIT_PLACEHOLDER,
  FEE_PLACEHOLDER,
  MINIMAL_FEE,
  MINIMAL_FEE_PER_BYTE,
  MINIMAL_FEE_PER_GAS_UNIT,
} from './constants';

const sumUpInternalFees = async (metadata: RunOperationMetadata) => {
  let gasLimit = 0;
  let storageLimit = 0;

  if (!metadata.internal_operation_results) {
    return {
      gasLimit,
      storageLimit,
    };
  }

  // If there are internal operations, we first add gas and storage used of internal operations
  metadata.internal_operation_results.forEach(
    (internalOperation: RunOperationInternalOperationResult) => {
      if (internalOperation?.result) {
        if (internalOperation.result.errors) {
          throw new Error(
            `An internal operation produced an error ${JSON.stringify(
              internalOperation.result.errors,
            )}`,
          );
        }

        gasLimit += Math.ceil(
          Number(internalOperation.result.consumed_milligas) / 1000,
        );

        if (internalOperation.result.paid_storage_size_diff) {
          storageLimit += Number(
            internalOperation.result.paid_storage_size_diff,
          );
        }

        if (internalOperation.result.originated_contracts) {
          storageLimit +=
            internalOperation.result.originated_contracts.length * 257;
        }

        if (internalOperation.result.allocated_destination_contract) {
          storageLimit += 257;
        }
      }
    },
  );

  return {
    gasLimit,
    storageLimit,
  };
};

const sumUpFees = async (
  tezosWrappedOperation: TezosWrappedOperation,
  response: RunOperationResponse,
  overrideParameters: boolean,
): Promise<number> => {
  let gasLimitTotal = 0;

  tezosWrappedOperation.contents.forEach(
    async (content: TezosOperation, i: number) => {
      const { metadata } = response.contents[i];
      if (!metadata.operation_result) {
        return;
      }
      const operation: TezosOperation = content;

      const result: RunOperationOperationResult = metadata.operation_result;

      if (result.errors) {
        throw new Error(
          `The operation produced an error ${JSON.stringify(result.errors)}`,
        );
      }

      let { gasLimit, storageLimit } = await sumUpInternalFees(metadata);

      // Add gas and storage used by operation
      gasLimit += Math.ceil(Number(result.consumed_milligas) / 1000);

      if (result.paid_storage_size_diff) {
        storageLimit += Number(result.paid_storage_size_diff);
      }

      if (result.originated_contracts) {
        storageLimit += result.originated_contracts.length * 257;
      }

      if (result.allocated_destination_contract) {
        storageLimit += 257;
      }

      if (
        ((operation as any).gas_limit && overrideParameters) ||
        (operation as any).gas_limit === GAS_LIMIT_PLACEHOLDER
      ) {
        (operation as any).gas_limit = gasLimit.toString();
      }

      if (
        ((operation as any).storage_limit && overrideParameters) ||
        (operation as any).storage_limit === STORAGE_LIMIT_PLACEHOLDER
      ) {
        (operation as any).storage_limit = storageLimit.toString();
      }
      gasLimitTotal += gasLimit;
    },
  );

  return gasLimitTotal;
};

export const estimateAndReplaceLimitsAndFee = async (
  tezosWrappedOperation: TezosWrappedOperation,
  nodeUrl: string,
  overrideParameters = true,
  startingCounter?: BigNumber,
): Promise<TezosWrappedOperation> => {
  const fakeSignature =
    'sigUHx32f9wesZ1n2BWpixXz4AQaZggEtchaQNHYGRCoWNAXx45WGW2ua3apUUUAGMLPwAU41QoaFCzVSL61VaessLg4YbbP';
  const opKinds = [
    TezosOperationType.TRANSACTION,
    TezosOperationType.REVEAL,
    TezosOperationType.ORIGINATION,
    TezosOperationType.DELEGATION,
  ];
  type TezosOp =
    | TezosTransactionOperation
    | TezosRevealOperation
    | TezosDelegationOperation
    | TezosOriginationOperation;
  const contents = tezosWrappedOperation.contents.map((operation, i) => {
    if (!opKinds.includes(operation.kind)) {
      return operation;
    }

    const op = operation as TezosOp;
    const gasValue = new BigNumber(MAX_GAS_PER_BLOCK).dividedToIntegerBy(
      tezosWrappedOperation.contents.length,
    );
    const gasLimit = new BigNumber(GAS_LIMIT_PLACEHOLDER).gt(gasValue)
      ? gasValue
      : GAS_LIMIT_PLACEHOLDER;
    const counter = startingCounter
      ? startingCounter.plus(i).toString()
      : op.counter;
    return { ...operation, gas_limit: gasLimit, counter };
  });

  const block: { chain_id: string } = await fetch(
    `${nodeUrl}chains/main/blocks/head`,
  ).then((x) => x.json());
  const body = {
    chain_id: block.chain_id,
    operation: {
      branch: tezosWrappedOperation.branch,
      contents,
      signature: fakeSignature, // signature will not be checked, so it is ok to always use this one
    },
  };
  const forgedOperation: string = await localForger.forge(
    tezosWrappedOperation as any,
  );

  const response: RunOperationResponse = await fetch(
    `${nodeUrl}chains/main/blocks/head/helpers/scripts/run_operation`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
    .then((x) => x.json())
    .catch((runOperationError: Error) => {
      throw runOperationError;
    });

  if (tezosWrappedOperation.contents.length !== response.contents.length) {
    throw new Error(
      `Run Operation did not return same number of operations. Locally we have ${tezosWrappedOperation.contents.length}, but got back ${response.contents.length}`,
    );
  }

  const gasLimitTotal = await sumUpFees(
    tezosWrappedOperation,
    response,
    overrideParameters,
  );

  if (
    overrideParameters ||
    tezosWrappedOperation.contents.some(
      (operation) => (operation as any)?.fee === FEE_PLACEHOLDER,
    )
  ) {
    const fee: number =
      MINIMAL_FEE +
      MINIMAL_FEE_PER_BYTE * Math.ceil((forgedOperation.length + 128) / 2) + // 128 is the length of a hex signature
      MINIMAL_FEE_PER_GAS_UNIT * gasLimitTotal +
      100; // add 100 for safety

    const nonRevealOperations = tezosWrappedOperation.contents.filter(
      (operation) => operation.kind !== 'reveal',
    );
    const feePerOperation: number = Math.ceil(fee / nonRevealOperations.length);

    tezosWrappedOperation.contents.forEach((operation: TezosOperation) => {
      if (
        (operation as TezosTransactionOperation).fee &&
        (operation as TezosRevealOperation).kind !== 'reveal'
      ) {
        (operation as TezosTransactionOperation).fee =
          feePerOperation.toString();
      }
    });
  }

  return tezosWrappedOperation;
};
