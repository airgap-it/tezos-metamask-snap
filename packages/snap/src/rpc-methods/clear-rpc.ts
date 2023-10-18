import { panel, heading, text, divider } from '@metamask/snaps-ui';
import { DEFAULT_NODE_URL } from '../constants';
import { METAMASK_UI_BUSY_ERROR, USER_REJECTED_ERROR } from '../utils/errors';
import { createOriginElement } from '../ui/origin-element';
import { confirmationWrapper } from '../utils/confirmation-wrapper';
import { isUiBusy } from '../utils/ui-busy';
import { ReturnWrapper } from '../types';

export const tezosClearRpc = async (
  origin: string,
): ReturnWrapper<{
  network: string;
  nodeUrl: string;
}> => {
  if (isUiBusy()) {
    return { error: METAMASK_UI_BUSY_ERROR() };
  }

  const approved = await confirmationWrapper({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Clear RPC'),
        text(
          `Do you want to clear the RPC settings and use the default RPC node again?`,
        ),
        divider(),
        ...createOriginElement(origin),
      ]),
    },
  });

  if (!approved) {
    throw USER_REJECTED_ERROR();
  }

  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'clear',
    },
  });

  return {
    result: {
      network: 'mainnet',
      nodeUrl: DEFAULT_NODE_URL,
    },
  };
};
