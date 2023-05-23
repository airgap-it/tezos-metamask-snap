import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import { getRpc } from '../utils/get-rpc';

export const tezosGetRpc = async (_params: any) => {
  const rpc = await getRpc();

  const approved = await snap.request({
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
        copyable(rpc.url),
      ]),
    },
  });

  if (!approved) {
    throw new Error('User rejected');
  }

  return {
    network: rpc.network,
    rpcUrl: rpc.url,
  };
};
