import { ErrorWrapper } from './utils/errors';

export type SnapStorage = {
  rpc: {
    network: string;
    nodeUrl: string;
  };
};

export type ReturnWrapper<T> = Promise<
  | {
      result: T;
    }
  | {
      error: ErrorWrapper;
    }
>;
