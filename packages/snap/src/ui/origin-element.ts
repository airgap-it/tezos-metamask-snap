import { copyable, text } from '@metamask/snaps-ui';

export const createOriginElement = (origin: string) => {
  return [text(`Requested from:`), copyable(origin)];
};
