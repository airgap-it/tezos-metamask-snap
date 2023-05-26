import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import { SnapStorage } from '../types';

export const tezosSetRpc = async (params: any) => {
  const { network, nodeUrl }: { network: string; nodeUrl: string } =
    params as any;

  if (!nodeUrl.startsWith('https://')) {
    throw new Error('RPC URL needs to start with https://');
  }

  const normalisedNodeUrl = `${nodeUrl}${nodeUrl.endsWith('/') ? '' : '/'}`;

  const header = await fetch(
    `${normalisedNodeUrl}chains/main/blocks/head/header`,
  )
    .then((res) => res.json())
    .catch(() => {
      throw new Error('Invalid RPC URL');
    });

  if (!header.hash || !header.chain_id) {
    throw new Error('Invalid RPC response');
  }

  const approved = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Set RPC'),
        text(`Do you want to set the RPC to the following address?`),
        divider(),
        text(`${network}`),
        copyable(nodeUrl),
      ]),
    },
  });

  if (!approved) {
    throw new Error('User rejected');
  }

  const newState: SnapStorage = {
    rpc: { network, nodeUrl: normalisedNodeUrl },
  };

  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState,
    },
  });

  return {
    network,
    nodeUrl,
  };
};
