import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import BigNumber from 'bignumber.js';
import { getWallet } from '../utils/get-wallet';
import { prepareAndSign } from '../utils/prepare-and-sign';
import { getRpc } from '../utils/get-rpc';
import { to } from '../utils/to';
import { USER_REJECTED_ERROR } from '../utils/errors';
import { TezosTransactionOperation } from '../tezos/types';
import { createOriginElement } from '../ui/origin-element';

const mutezToTez = (mutez: string): string => {
  return BigNumber(mutez).shiftedBy(-6).toString(10);
};

export const tezosSendOperation = async (origin: string, params: any) => {
  const { payload } = params;
  const wallet = await getWallet();
  const rpc = await getRpc();

  const typedPayload: TezosTransactionOperation[] = payload;

  const humanReadable = [];

  if (typedPayload[0] && typedPayload[0].kind === 'transaction') {
    humanReadable.push(
      text(`**To:** ${typedPayload[0].destination}`),
      text(`**Amount:** ${mutezToTez(typedPayload[0].amount)} tez`),
      text(`**Fee:** ${mutezToTez(typedPayload[0].fee)} tez`),
      text(`**Gas Limit:** ${mutezToTez(typedPayload[0].fee)} tez`),
      text(`**Storage Limit:** ${mutezToTez(typedPayload[0].fee)} tez`),
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

  return { opHash: await prepareAndSign(payload, wallet, rpc.nodeUrl) };
};
