import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import { SnapStorage } from '../types';
import {
  RPC_NO_HTTPS_ERROR,
  RPC_INVALID_URL_ERROR,
  RPC_INVALID_RESPONSE_ERROR,
  USER_REJECTED_ERROR,
} from '../utils/errors';

export const tezosSetRpc = async (params: any) => {
  const { network, nodeUrl }: { network: string; nodeUrl: string } = params;

  if (!nodeUrl.startsWith('https://')) {
    throw RPC_NO_HTTPS_ERROR();
  }

  const normalisedNodeUrl = `${nodeUrl}${nodeUrl.endsWith('/') ? '' : '/'}`;

  const header = await fetch(
    `${normalisedNodeUrl}chains/main/blocks/head/header`,
  )
    .then((res) => res.json())
    .catch(() => {
      throw RPC_INVALID_URL_ERROR();
    });

  if (!header.hash || !header.chain_id) {
    throw RPC_INVALID_RESPONSE_ERROR();
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
    throw USER_REJECTED_ERROR();
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
