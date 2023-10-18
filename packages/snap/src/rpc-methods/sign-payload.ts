import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { getWallet } from '../utils/get-wallet';
import { sign } from '../utils/sign';
import { METAMASK_UI_BUSY_ERROR, USER_REJECTED_ERROR } from '../utils/errors';
import { createOriginElement } from '../ui/origin-element';
import { confirmationWrapper } from '../utils/confirmation-wrapper';
import { isUiBusy } from '../utils/ui-busy';
import { ReturnWrapper } from '../types';

export const tezosSignPayload = async (
  origin: string,
  params: { payload: string },
): ReturnWrapper<{
  signature: {
    bytes: string;
    sig: string;
    prefixSig: string;
    sbytes: string;
  };
}> => {
  if (isUiBusy()) {
    return { error: METAMASK_UI_BUSY_ERROR() };
  }

  const { payload } = params;
  const wallet = await getWallet();

  const approved = await confirmationWrapper({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Sign Payload'),
        text('Do you want to sign the following payload?'),
        copyable(JSON.stringify(payload)),
        divider(),
        ...createOriginElement(origin),
      ]),
    },
  });

  if (!approved) {
    return { error: USER_REJECTED_ERROR() };
  }

  return { result: await sign(payload, undefined, wallet) };
};
