import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import { ReturnWrapper, SnapStorage } from '../types';
import {
  RPC_NO_HTTPS_ERROR,
  RPC_INVALID_URL_ERROR,
  RPC_INVALID_RESPONSE_ERROR,
  USER_REJECTED_ERROR,
  RPC_NO_URL_ERROR,
  METAMASK_UI_BUSY_ERROR,
} from '../utils/errors';
import { createOriginElement } from '../ui/origin-element';
import { confirmationWrapper } from '../utils/confirmation-wrapper';
import { isUiBusy } from '../utils/ui-busy';

export const tezosSetRpc = async (
  origin: string,
  params: { network: string; nodeUrl: string },
): ReturnWrapper<{
  network: string;
  nodeUrl: string;
}> => {
  if (isUiBusy()) {
    return { error: METAMASK_UI_BUSY_ERROR() };
  }

  const { network, nodeUrl }: { network: string; nodeUrl: string } = params;

  if (!nodeUrl) {
    return { error: RPC_NO_URL_ERROR() };
  }

  if (!nodeUrl.startsWith('https://')) {
    return { error: RPC_NO_HTTPS_ERROR() };
  }

  const normalisedNodeUrl = `${nodeUrl}${nodeUrl.endsWith('/') ? '' : '/'}`;

  const header = await fetch(
    `${normalisedNodeUrl}chains/main/blocks/head/header`,
  )
    .then((res) => res.json())
    .catch(() => {
      // TODO: Check return
      return { error: RPC_INVALID_URL_ERROR() };
    });

  if (!header.hash || !header.chain_id) {
    return { error: RPC_INVALID_RESPONSE_ERROR() };
  }

  const approved = await confirmationWrapper({
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
    return { error: USER_REJECTED_ERROR() };
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
    result: {
      network,
      nodeUrl,
    },
  };
};
