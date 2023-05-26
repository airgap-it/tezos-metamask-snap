import { DEFAULT_NODE_URL } from '../constants';
import { SnapStorage } from '../types';

export const getRpc = async () => {
  const persistedData = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  const typedData: SnapStorage = persistedData as any;

  const network = typedData?.rpc?.network ?? 'mainnet';
  const nodeUrl = typedData?.rpc?.nodeUrl ?? DEFAULT_NODE_URL;

  return {
    network,
    nodeUrl,
  };
};
