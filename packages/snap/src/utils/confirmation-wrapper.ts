import { RequestFunction } from '@metamask/rpc-methods';
import { setisUiBusy } from './ui-busy';

export const confirmationWrapper: RequestFunction = (args) => {
  setisUiBusy(true);

  const response = snap.request(args);
  response.finally(() => setisUiBusy(false));

  return response;
};
