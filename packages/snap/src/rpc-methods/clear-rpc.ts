import { panel, heading, text } from '@metamask/snaps-ui';
import { DEFAULT_NODE_URL } from '../constants';

export const tezosClearRpc = async (_params: any) => {
  const approved = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Clear RPC'),
        text(
          `Do you want to clear the RPC settings and use the default RPC node again?`,
        ),
      ]),
    },
  });

  if (!approved) {
    throw new Error('User rejected');
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
