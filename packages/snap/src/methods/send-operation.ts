import { panel, heading, text, copyable } from '@metamask/snaps-ui';
import { getWallet } from '../utils/get-wallet';
import { prepareAndSign } from '../utils/prepare-and-sign';

export const tezosSendOperation = async (params: any) => {
  const { payload } = params as any;
  const wallet = await getWallet();

  const approved = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Sign Operation'),
        text('Do you want to sign the following payload?'),
        copyable(JSON.stringify(payload, null, 2)),
      ]),
    },
  });

  console.log('approved', approved);

  if (!wallet) {
    return '';
  }

  return { opHash: await prepareAndSign(payload, wallet) };
};
