import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import BigNumber from 'bignumber.js';
import { getWallet } from '../utils/get-wallet';
import { prepare } from '../utils/prepare';
import { getRpc } from '../utils/get-rpc';
import { to } from '../utils/to';
import { NO_OPERATION_ERROR, USER_REJECTED_ERROR } from '../utils/errors';
import { TezosTransactionOperation } from '../tezos/types';
import { createOriginElement } from '../ui/origin-element';
import { sign } from '../utils/sign';
import { injectTransaction } from '../tezos/inject-transaction';

const mutezToTez = (mutez: string): string => {
  return BigNumber(mutez).shiftedBy(-6).toString(10);
};

const aggregate = (array: any[], field: string) => {
  return array
    .reduce((pv, cv): BigNumber => {
      return pv.plus(cv[field]);
    }, new BigNumber(0))
    .toString();
};

export const tezosSendOperation = async (origin: string, params: any) => {
  const { payload } = params;
  const wallet = await getWallet();
  const rpc = await getRpc();

  const prepareResult = await prepare(payload, wallet, rpc.nodeUrl);
  const typedPayload: TezosTransactionOperation[] = prepareResult.estimated
    .contents as any;

  if (typedPayload.length === 0) {
    throw NO_OPERATION_ERROR();
  }

  const humanReadable = [];

  if (typedPayload.length > 1) {
    if (typedPayload.every((el) => el.kind === 'transaction')) {
      // If we have more than one operation and all of them are "transaction" operations, we aggregate
      humanReadable.push(
        text(`This operation group contains multiple the aggregated fees.`),
        text(
          `**Amount:** ${mutezToTez(aggregate(typedPayload, 'amount'))} tez`,
        ),
        text(`**Fee:** ${mutezToTez(aggregate(typedPayload, 'fee'))} tez`),
        text(
          `**Gas Limit:** ${mutezToTez(
            aggregate(typedPayload, 'gas_limit'),
          )} tez`,
        ),
        text(
          `**Storage Limit:** ${mutezToTez(
            aggregate(typedPayload, 'storage_limit'),
          )} tez`,
        ),
      );
    } else if (!typedPayload.every((el) => el.kind === 'transaction')) {
      // If we have more than one operation and some are not of kind "transaction", we show a note
      humanReadable.push(
        text(`**This operation group contains multiple operations.**`),
      );
    }
  } else if (typedPayload[0].kind === 'transaction') {
    // If transaction operation, we show additional information
    humanReadable.push(
      text(`**To:** ${typedPayload[0].destination}`),
      text(`**Amount:** ${mutezToTez(typedPayload[0].amount)} tez`),
      text(`**Fee:** ${mutezToTez(typedPayload[0].fee)} tez`),
      text(`**Gas Limit:** ${mutezToTez(typedPayload[0].gas_limit)} tez`),
      text(
        `**Storage Limit:** ${mutezToTez(typedPayload[0].storage_limit)} tez`,
      ),
    );
  } else {
    // If one operation, we show kind
    humanReadable.push(text(`**Kind:** ${typedPayload[0].kind}`));
  }

  // If "parameter" is present (contract call), we show a note
  if (typedPayload.some((el) => el.kind === 'transaction' && el.parameters)) {
    humanReadable.push(
      text(
        `**Note:** This is a contract call. Please only sign this operation if you trust the origin.`,
      ),
    );
  }

  const [approveError, approved] = await to<string | boolean | null>(
    snap.request({
      method: 'snap_dialog',
      params: {
        type: 'confirmation',
        content: panel([
          heading('Sign Operation'),
          text('Do you want to sign the following payload?'),
          ...humanReadable,
          copyable(JSON.stringify(payload, null, 2)),
          divider(),
          text(`The operation will be submit to the following node:`),
          copyable(rpc.nodeUrl),
          divider(),
          ...createOriginElement(origin),
        ]),
      },
    }),
  );

  if (approveError) {
    throw new Error(`APPROVE ERROR ${approveError.message}`);
  }

  if (!approved) {
    throw USER_REJECTED_ERROR();
  }

  const operationWatermark = new Uint8Array([3]);
  const signResult = await sign(
    prepareResult.forged,
    operationWatermark,
    wallet,
  );

  const opHash = await injectTransaction(
    signResult.signature.sbytes,
    rpc.nodeUrl,
  );

  return { opHash };
};
