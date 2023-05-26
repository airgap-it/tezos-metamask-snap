import { stub } from 'sinon';
// Parts of this code are taken from https://github.com/ConsenSys/starknet-snap/blob/main/packages/starknet-snap/test/wallet.mock.test.ts

export type Snap = {
  registerRpcMessageHandler: (fn: () => void) => unknown;
  request(options: {
    method: string;
    params?: { [key: string]: unknown } | unknown[];
  }): unknown;
};

export class SnapMock implements Snap {
  public readonly registerRpcMessageHandler = stub();

  public readonly requestStub = stub();

  public readonly rpcStubs = {
    snap_getBip32Entropy: stub(),
    snap_dialog: stub(),
    snap_manageState: stub(),
  };

  /**
   * Calls this.requestStub or this.rpcStubs[req.method], if the method has
   * a dedicated stub.
   *
   * @param args - The arguments of the rpc call
   * @param args.method - The method of the request
   * @param args.params - The parameters of the request
   * @returns Sinon Stub
   */
  public request(args: {
    method: string;
    params: { [key: string]: unknown } | unknown[];
  }): unknown {
    const { method, params } = args;
    if (Object.hasOwnProperty.call(this.rpcStubs, method)) {
      if (Array.isArray(params)) {
        return this.rpcStubs[method as keyof typeof this.rpcStubs](...params);
      }
      return this.rpcStubs[method as keyof typeof this.rpcStubs](params);
    }
    return this.requestStub(args);
  }

  public reset(): void {
    this.registerRpcMessageHandler.reset();
    this.requestStub.reset();
    Object.values(this.rpcStubs).forEach((rpcStub) => rpcStub.reset());
  }
}
