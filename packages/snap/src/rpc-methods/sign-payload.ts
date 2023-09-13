import { copyable, heading, panel, text } from '@metamask/snaps-ui';
import { getWallet } from '../utils/get-wallet';
import { sign } from '../utils/sign';
import { USER_REJECTED_ERROR } from '../utils/errors';

export const tezosSignPayload = async (params: any) => {
  const { payload } = params;
  const wallet = await getWallet();

  const approved = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Sign Payload'),
        text('Do you want to sign the following payload?'),
        copyable(JSON.stringify(payload)),
      ]),
    },
  });

  if (!approved) {
    throw USER_REJECTED_ERROR();
  }

  return sign(payload, undefined, wallet);
};
