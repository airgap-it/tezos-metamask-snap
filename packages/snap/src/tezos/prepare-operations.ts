import { localForger } from '@taquito/local-forging';
import BigNumber from 'bignumber.js';
import * as bs58check from 'bs58check';

const MAX_GAS_PER_BLOCK = 2600000;
const GAS_LIMIT_PLACEHOLDER = '1040000';
const STORAGE_LIMIT_PLACEHOLDER = '60000';
const FEE_PLACEHOLDER = '0';

const MINIMAL_FEE = 100;
const MINIMAL_FEE_PER_GAS_UNIT = 0.1;
const MINIMAL_FEE_PER_BYTE = 1;

export enum TezosOperationType {
  ENDORSEMENT = 'endorsement',
  SEED_NONCE_REVELATION = 'seed_nonce_revelation',
  DOUBLE_ENDORSEMENT_EVIDENCE = 'double_endorsement_evidence',
  DOUBLE_BAKING_EVIDENCE = 'double_baking_evidence',
  ACTIVATE_ACCOUNT = 'activate_account',
  PROPOSALS = 'proposals',
  BALLOT = 'ballot',
  REVEAL = 'reveal',
  TRANSACTION = 'transaction',
  ORIGINATION = 'origination',
  DELEGATION = 'delegation',
}

export type TezosOperation = {
  kind: TezosOperationType;
};

export type TezosTransactionOperation = {
  kind: TezosOperationType.TRANSACTION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  amount: string;
  destination: string;
  parameters?: any;
} & TezosOperation;

export type TezosOriginationOperation = {
  kind: TezosOperationType.DELEGATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  balance: string;
  delegate?: string;
  script: string;
} & TezosOperation;

export type TezosRevealOperation = {
  kind: TezosOperationType.REVEAL;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  public_key: string;
} & TezosOperation;

export type TezosDelegationOperation = {
  kind: TezosOperationType.DELEGATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  delegate?: string;
} & TezosOperation;

// run_operation response
export type RunOperationBalanceUpdate = {
  kind: string;
  contract: string;
  change: string;
  category: string;
  delegate: string;
  cycle?: number;
};

export type RunOperationOperationBalanceUpdate = {
  kind: string;
  contract: string;
  change: string;
};

export type RunOperationOperationResult = {
  status: string;
  errors?: unknown;
  balance_updates: RunOperationOperationBalanceUpdate[];
  consumed_milligas: string;
  paid_storage_size_diff?: string;
  originated_contracts?: string[];
  allocated_destination_contract?: boolean;
};

type RunOperationInternalOperationResult = {
  result?: {
    errors?: unknown;
    consumed_milligas: string;
    paid_storage_size_diff?: string;
    originated_contracts?: string[];
    allocated_destination_contract?: boolean;
  };
  parameters?: {
    entrypoint: string;
    value: unknown;
  };
};

export type RunOperationMetadata = {
  balance_updates: RunOperationBalanceUpdate[];
  operation_result: RunOperationOperationResult;
  internal_operation_results?: RunOperationInternalOperationResult[];
};

type RunOperationResponse = {
  contents: (TezosOperation & {
    metadata: RunOperationMetadata;
  })[];
  signature: string;
};

export type TezosWrappedOperation = {
  branch: string;
  contents: TezosOperation[];
};

const createRevealOperation = async (
  counter: BigNumber,
  publicKey: string,
  address: string,
  fee: string = new BigNumber('1300').toFixed(),
): Promise<TezosOperation> => {
  const operation = {
    kind: TezosOperationType.REVEAL,
    fee,
    gas_limit: '10000', // taken from conseiljs
    storage_limit: '0', // taken from conseiljs
    counter: counter.toFixed(),
    public_key: bs58check.encode(
      Buffer.concat([
        Buffer.from(new Uint8Array([13, 15, 37, 217])),
        Buffer.from(publicKey, 'hex'),
      ]),
    ),
    source: address,
  };

  return operation;
};

const getBalanceOfAddresses = async (
  addresses: string[],
  _data?: any,
): Promise<string> => {
  let balance: BigNumber = new BigNumber(0);

  for (const address of addresses) {
    try {
      const data = await fetch(
        `https://tezos-node.prod.gke.papers.tech/chains/main/blocks/head/context/contracts/${address}/balance`,
      ).then((x) => x.json());
      balance = balance.plus(new BigNumber(data));
    } catch (error: any) {
      // if node returns 404 (which means 'no account found'), go with 0 balance
      if (error.response && error.response.status !== 404) {
        throw new Error(error);
      }
    }
  }

  return balance.toString(10);
};

const estimateAndReplaceLimitsAndFee = async (
  tezosWrappedOperation: TezosWrappedOperation,
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
    `https://tezos-node.prod.gke.papers.tech/chains/main/blocks/head`,
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
  let gasLimitTotal = 0;

  const response: RunOperationResponse = await fetch(
    `https://tezos-node.prod.gke.papers.tech/chains/main/blocks/head/helpers/scripts/run_operation`,
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

  //   if (Math.random() > 0) {
  //     throw new Error(`Test ${JSON.stringify(response)}`);
  //   }

  if (tezosWrappedOperation.contents.length !== response.contents.length) {
    throw new Error(
      `Run Operation did not return same number of operations. Locally we have ${tezosWrappedOperation.contents.length}, but got back ${response.contents.length}`,
    );
  }

  tezosWrappedOperation.contents.forEach(
    (content: TezosOperation, i: number) => {
      const { metadata } = response.contents[i];
      if (metadata.operation_result) {
        const operation: TezosOperation = content;

        const result: RunOperationOperationResult = metadata.operation_result;
        let gasLimit = 0;
        let storageLimit = 0;

        // If there are internal operations, we first add gas and storage used of internal operations
        if (metadata.internal_operation_results) {
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
        }

        if (result.errors) {
          throw new Error(
            `The operation produced an error ${JSON.stringify(result.errors)}`,
          );
        }

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

        // in prepareTransactionsFromPublicKey() we invoke this method with overrideParameters = false
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
      }
    },
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

export const prepareOperations = async (
  address: string,
  publicKey: string,
  operationRequests: TezosOperation[],
  overrideParameters = true,
): Promise<string> => {
  let counter: BigNumber = new BigNumber(1);
  const operations: TezosOperation[] = [];

  const results = await Promise.all(
    (
      await Promise.all([
        fetch(
          `https://tezos-node.prod.gke.papers.tech/chains/main/blocks/head/context/contracts/${address}/counter`,
        ),
        fetch(
          `https://tezos-node.prod.gke.papers.tech/chains/main/blocks/head~2/hash`,
        ),
        fetch(
          `https://tezos-node.prod.gke.papers.tech/chains/main/blocks/head/context/contracts/${address}/manager_key`,
        ),
      ]).catch((error) => {
        throw new Error(error);
      })
    ).map((x) => x.json()),
  );

  counter = new BigNumber(results[0]).plus(1);
  const branch = results[1];

  console.log(counter, branch);

  const accountManager: { key: string } = results[2];

  const hasRevealInOperationRequests = operationRequests.some(
    (request: TezosOperation) => request.kind === TezosOperationType.REVEAL,
  );

  // check if we have revealed the address already
  if (!accountManager && !hasRevealInOperationRequests) {
    operations.push(await createRevealOperation(counter, publicKey, address));
    counter = counter.plus(1);
  }

  // tslint:disable:cyclomatic-complexity
  const operationPromises: Promise<TezosOperation>[] = operationRequests.map(
    async (operationRequest: TezosOperation, index: number) => {
      // TODO: Handle activation burn

      if (!operationRequest.kind) {
        throw new Error(
          `property "kind" was not defined ${JSON.stringify(operationRequest)}`,
        );
      }

      const recipient: string | undefined = (
        operationRequest as TezosTransactionOperation
      ).destination;
      let receivingBalance: BigNumber | undefined;
      if (recipient?.toLowerCase().startsWith('tz')) {
        receivingBalance = new BigNumber(
          await getBalanceOfAddresses([recipient]),
        );
      }

      const defaultCounter: string = counter.plus(index).toFixed(); // TODO: Handle counter if we have some operations without counters in the array
      const defaultFee: string = FEE_PLACEHOLDER;
      const defaultGasLimit = '10300';
      const defaultStorageLimit: string =
        receivingBalance?.isZero() &&
        recipient &&
        recipient.toLowerCase().startsWith('tz')
          ? '300'
          : '0'; // taken from eztz

      switch (operationRequest.kind) {
        // TODO: Handle if the dApp already provides a reveal operation
        case TezosOperationType.REVEAL:
          // eslint-disable-next-line no-case-declarations
          const revealOperation: TezosRevealOperation =
            operationRequest as TezosRevealOperation;

          if (!revealOperation.public_key) {
            throw new Error('property "public_key" was not defined');
          }

          revealOperation.source = revealOperation.source ?? address;
          revealOperation.counter = revealOperation.counter ?? defaultCounter;
          revealOperation.fee = revealOperation.fee ?? defaultFee;
          revealOperation.gas_limit =
            revealOperation.gas_limit ?? defaultGasLimit;

          revealOperation.storage_limit =
            revealOperation.storage_limit ?? defaultStorageLimit;

          return revealOperation;
        case TezosOperationType.DELEGATION:
          // eslint-disable-next-line no-case-declarations
          const delegationOperation: TezosDelegationOperation =
            operationRequest as TezosDelegationOperation;

          // The delegate property is optional, so we don't have any mandatory properties to check for

          delegationOperation.source = delegationOperation.source ?? address;
          delegationOperation.counter =
            delegationOperation.counter ?? defaultCounter;
          delegationOperation.fee = delegationOperation.fee ?? defaultFee;
          delegationOperation.gas_limit =
            delegationOperation.gas_limit ?? defaultGasLimit;

          delegationOperation.storage_limit =
            delegationOperation.storage_limit ?? defaultStorageLimit;

          return delegationOperation;
        case TezosOperationType.TRANSACTION:
          // eslint-disable-next-line no-case-declarations
          const transactionOperation: TezosTransactionOperation =
            operationRequest as TezosTransactionOperation;

          if (!transactionOperation.amount) {
            throw new Error('property "amount" was not defined');
          }

          if (!transactionOperation.destination) {
            throw new Error('property "destination" was not defined');
          }

          transactionOperation.source = transactionOperation.source ?? address;
          transactionOperation.counter =
            transactionOperation.counter ?? defaultCounter;
          transactionOperation.fee = transactionOperation.fee ?? defaultFee;
          transactionOperation.gas_limit =
            transactionOperation.gas_limit ?? GAS_LIMIT_PLACEHOLDER;

          transactionOperation.storage_limit =
            transactionOperation.storage_limit ?? STORAGE_LIMIT_PLACEHOLDER;

          return transactionOperation;
        case TezosOperationType.ORIGINATION:
          // eslint-disable-next-line no-case-declarations
          const originationOperation: TezosOriginationOperation =
            operationRequest as TezosOriginationOperation;

          if (!originationOperation.balance) {
            throw new Error('property "balance" was not defined');
          }

          if (!originationOperation.script) {
            throw new Error('property "script" was not defined');
          }

          originationOperation.source = originationOperation.source ?? address;
          originationOperation.counter =
            originationOperation.counter ?? defaultCounter;
          originationOperation.fee = originationOperation.fee ?? defaultFee;
          originationOperation.gas_limit =
            originationOperation.gas_limit ?? GAS_LIMIT_PLACEHOLDER;

          originationOperation.storage_limit =
            originationOperation.storage_limit ?? STORAGE_LIMIT_PLACEHOLDER;

          return originationOperation;
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
          throw new Error(
            `unsupported operation type "${JSON.stringify(
              operationRequest.kind,
            )}"`,
          );
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
    overrideParameters,
  );

  return await localForger.forge(estimated as any);
};

export const broadcastTransaction = async (
  rawTransaction: string,
): Promise<string> => {
  const payload: string = rawTransaction;

  const response = await fetch(
    `https://tezos-node.prod.gke.papers.tech/injection/operation?chain=main`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    },
  ).catch((error: Error) => {
    throw error;
  });

  // returns hash if successful
  return await response.json();
};
