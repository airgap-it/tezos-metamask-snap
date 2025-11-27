import { getRpc } from '../utils/get-rpc';

export const tezosGetRpc = async () => {
  const rpc = await getRpc();

  return {
    network: rpc.network,
    nodeUrl: rpc.nodeUrl,
  };
};
