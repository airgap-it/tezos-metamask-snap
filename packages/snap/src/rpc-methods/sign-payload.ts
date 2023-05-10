import { copyable, heading, panel, text } from '@metamask/snaps-ui';
import { getWallet } from '../utils/get-wallet';
import { sign } from '../utils/sign';

export const tezosSignPayload = async (params: any) => {
  const { payload } = params as any;
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
    throw new Error('User rejected');
  }

  if (!wallet) {
    return '';
  }

  return sign(payload, undefined, wallet);
};
