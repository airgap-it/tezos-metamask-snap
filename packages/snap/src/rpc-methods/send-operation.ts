import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import BigNumber from 'bignumber.js';
import { getWallet } from '../utils/get-wallet';
import { prepare } from '../utils/prepare';
import { getRpc } from '../utils/get-rpc';
import {
  METAMASK_UI_BUSY_ERROR,
  NO_OPERATION_ERROR,
  USER_REJECTED_ERROR,
} from '../utils/errors';
import { TezosOperation, TezosTransactionOperation } from '../tezos/types';
import { createOriginElement } from '../ui/origin-element';
import { sign } from '../utils/sign';
import { injectTransaction } from '../tezos/inject-transaction';
import { confirmationWrapper } from '../utils/confirmation-wrapper';
import { aggregate } from '../utils/aggregate';
import { isUiBusy } from '../utils/ui-busy';
import { ReturnWrapper } from '../types';

const mutezToTez = (mutez: string): string => {
  return BigNumber(mutez).shiftedBy(-6).toString(10);
};

export const tezosSendOperation = async (
  origin: string,
  params: { payload: TezosOperation[] },
): ReturnWrapper<{
  opHash: string;
}> => {
  if (isUiBusy()) {
    return { error: METAMASK_UI_BUSY_ERROR() };
  }

  const { payload } = params;
  const wallet = await getWallet();
  const rpc = await getRpc();

  const prepareResult = await prepare(payload, wallet, rpc.nodeUrl);
  const typedPayload: TezosTransactionOperation[] = prepareResult.estimated
    .contents as any;

  if (typedPayload.length === 0) {
    return { error: NO_OPERATION_ERROR() };
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

  const approved = await confirmationWrapper({
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
  });

  if (!approved) {
    return { error: USER_REJECTED_ERROR() };
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

  return { result: { opHash } };
};
