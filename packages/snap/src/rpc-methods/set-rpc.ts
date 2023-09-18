import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import { SnapStorage } from '../types';
import {
  RPC_NO_HTTPS_ERROR,
  RPC_INVALID_URL_ERROR,
  RPC_INVALID_RESPONSE_ERROR,
  USER_REJECTED_ERROR,
  RPC_NO_URL_ERROR,
} from '../utils/errors';
import { createOriginElement } from '../ui/origin-element';

export const tezosSetRpc = async (origin: string, params: any) => {
  const { network, nodeUrl }: { network: string; nodeUrl: string } = params;

  if (!nodeUrl) {
    throw RPC_NO_URL_ERROR();
  }

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
        divider(),
        ...createOriginElement(origin),
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
