import {
  panel,
  heading,
  text,
  copyable,
  divider,
  spinner,
} from '@metamask/snaps-ui';
import { getWallet } from '../utils/get-wallet';
import { prepareAndSign } from '../utils/prepare-and-sign';
import { getRpc } from '../utils/get-rpc';
import { to } from '../utils/to';
import { USER_REJECTED_ERROR } from '../utils/errors';

export const tezosSendOperation = async (params: any) => {
  const { payload } = params;
  const wallet = await getWallet();
  const rpc = await getRpc();

  await snap.request({
    method: 'snap_notify',
    params: {
      type: 'inApp',
      message: 'Hello, world inApp!',
    },
  });

  // await new Promise((resolve) => setTimeout(resolve, 1000));

  // await snap.request({
  //   method: 'snap_notify',
  //   params: {
  //     type: 'native',
  //     message: 'Hello, world native!',
  //   },
  // });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const [approveError, approved] = await to<string | boolean | null>(
    snap.request({
      method: 'snap_dialog',
      params: {
        type: 'confirmation',
        content: panel([
          spinner(),
          heading('Sign Operation'),
          text(`Text
        Newline`),
          text('Do you want to sign the following operation?'),
          text(`**Amount:** 0.00000 tez`),
          copyable(JSON.stringify(payload, null, 2)),
          divider(),
          text(`The operation will be submitted to the following node:`),
          copyable(rpc.nodeUrl),
        ]),
      },
    }),
  );

  if (approveError) {
    console.log('asdf');
  }

  if (!approved) {
    throw USER_REJECTED_ERROR();
  }

  return { opHash: await prepareAndSign(payload, wallet, rpc.nodeUrl) };
};
