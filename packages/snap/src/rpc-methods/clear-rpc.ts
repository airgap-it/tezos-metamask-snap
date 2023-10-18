import { panel, heading, text, divider } from '@metamask/snaps-ui';
import { DEFAULT_NODE_URL } from '../constants';
import { USER_REJECTED_ERROR } from '../utils/errors';
import { createOriginElement } from '../ui/origin-element';

export const tezosClearRpc = async (origin: string) => {
  const approved = await snap.request({
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
    network: 'mainnet',
    nodeUrl: DEFAULT_NODE_URL,
  };
};
