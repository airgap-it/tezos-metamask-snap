import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import { getRpc } from '../utils/get-rpc';
import { METAMASK_UI_BUSY_ERROR, USER_REJECTED_ERROR } from '../utils/errors';
import { createOriginElement } from '../ui/origin-element';
import { confirmationWrapper } from '../utils/confirmation-wrapper';
import { isUiBusy } from '../utils/ui-busy';
import { ReturnWrapper } from '../types';

export const tezosGetRpc = async (
  origin: string,
): ReturnWrapper<{
  network: string;
  nodeUrl: string;
}> => {
  if (isUiBusy()) {
    return { error: METAMASK_UI_BUSY_ERROR() };
  }

  const rpc = await getRpc();

  const approved = await confirmationWrapper({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Get RPC'),
        text(
          `Do you want to share with the dApp which RPC this MetaMask Snap is currently using?`,
        ),
        divider(),
        text(rpc.network),
        copyable(rpc.nodeUrl),
        divider(),
        ...createOriginElement(origin),
      ]),
    },
  });

  if (!approved) {
    return { error: USER_REJECTED_ERROR() };
  }

  return {
    result: {
      network: rpc.network,
      nodeUrl: rpc.nodeUrl,
    },
  };
};
