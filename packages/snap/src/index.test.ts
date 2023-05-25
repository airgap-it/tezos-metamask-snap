import chai, { expect } from 'chai';
import chaiBytes from 'chai-bytes';
import chaiAsPromised from 'chai-as-promised';

import { onRpcRequest } from './index';
import * as getAccountMethods from './rpc-methods/get-accounts';
import * as sendOperationMethods from './rpc-methods/send-operation';
import * as signPayloadMethods from './rpc-methods/sign-payload';
import * as getRpcMethods from './rpc-methods/get-rpc';
import * as setRpcMethods from './rpc-methods/set-rpc';
import * as clearRpcMethods from './rpc-methods/clear-rpc';

import * as sinon from 'sinon';
import { Json, JsonRpcRequest } from '@metamask/snaps-types';

chai.use(chaiBytes);
chai.use(chaiAsPromised);

const exampleParams = {
  test: 123,
};

const ORIGIN = 'http://localhost:1234';

const getRpcRequestWrapper = (
  method: string,
  params: Record<string, Json>,
): {
  origin: string;
  request: JsonRpcRequest<Record<string, Json> | Json[]>;
} => {
  return {
    origin: ORIGIN,
    request: {
      id: 'w-PC5_tENFbXqRnsvZkR3',
      jsonrpc: '2.0',
      method,
      params,
    },
  };
};

describe('Test function: onRpcRequest', function () {
  let getAccountStub = sinon.stub();
  let sendOperationStub = sinon.stub();
  let signPayloadStub = sinon.stub();
  let getRpcStub = sinon.stub();
  let setRpcStub = sinon.stub();
  let clearRpcStub = sinon.stub();

  beforeEach(function () {
    getAccountStub = sinon.stub(getAccountMethods, 'tezosGetAccount');
    sendOperationStub = sinon.stub(sendOperationMethods, 'tezosSendOperation');
    signPayloadStub = sinon.stub(signPayloadMethods, 'tezosSignPayload');
    getRpcStub = sinon.stub(getRpcMethods, 'tezosGetRpc');
    setRpcStub = sinon.stub(setRpcMethods, 'tezosSetRpc');
    clearRpcStub = sinon.stub(clearRpcMethods, 'tezosClearRpc');
  });
  afterEach(function () {
    sinon.restore();
  });

  it('should handle tezosGetAccount request', async function () {
    const returnValue = {
      curve: 'ed25519',
      publicKey: 'edpk...',
      address: 'tz1...',
    };

    getAccountStub.restore();
    getAccountStub = sinon
      .stub(getAccountMethods, 'tezosGetAccount')
      .returns(Promise.resolve(returnValue));

    const response = await onRpcRequest(
      getRpcRequestWrapper('tezos_getAccount', {}),
    );

    expect(response).to.deep.equal(returnValue);
    expect(getAccountStub).to.have.been.calledWithExactly(ORIGIN);

    expect(getAccountStub.callCount).to.equal(1, 'getAccountStub');
    expect(sendOperationStub.callCount).to.equal(0, 'sendOperationsStub');
    expect(signPayloadStub.callCount).to.equal(0, 'signPayloadStub');
    expect(getRpcStub.callCount).to.equal(0, 'getRpcStub');
    expect(setRpcStub.callCount).to.equal(0, 'setRpcStub');
    expect(clearRpcStub.callCount).to.equal(0, 'clearRpcStub');
  });

  it('should handle tezosSendOperation request', async function () {
    const returnValue = {
      opHash: 'op123',
    };

    sendOperationStub.restore();
    sendOperationStub = sinon
      .stub(sendOperationMethods, 'tezosSendOperation')
      .returns(Promise.resolve(returnValue));

    const response = await onRpcRequest(
      getRpcRequestWrapper('tezos_sendOperation', exampleParams),
    );

    expect(response).to.deep.equal(returnValue);
    expect(sendOperationStub).to.have.been.calledWithExactly(exampleParams);

    expect(getAccountStub.callCount).to.equal(0, 'getAccountStub');
    expect(sendOperationStub.callCount).to.equal(1, 'sendOperationsStub');
    expect(signPayloadStub.callCount).to.equal(0, 'signPayloadStub');
    expect(getRpcStub.callCount).to.equal(0, 'getRpcStub');
    expect(setRpcStub.callCount).to.equal(0, 'setRpcStub');
    expect(clearRpcStub.callCount).to.equal(0, 'clearRpcStub');
  });

  it('should handle tezosSignPayload request', async function () {
    const returnValue = {
      signature: {
        bytes: 'a',
        sig: 'b',
        prefixSig: 'c',
        sbytes: 'd',
      },
    };

    signPayloadStub.restore();
    signPayloadStub = sinon
      .stub(signPayloadMethods, 'tezosSignPayload')
      .returns(Promise.resolve(returnValue));

    const response = await onRpcRequest(
      getRpcRequestWrapper('tezos_signPayload', exampleParams),
    );

    expect(response).to.deep.equal(returnValue);
    expect(signPayloadStub).to.have.been.calledWithExactly(exampleParams);

    expect(getAccountStub.callCount).to.equal(0, 'getAccountStub');
    expect(sendOperationStub.callCount).to.equal(0, 'sendOperationsStub');
    expect(signPayloadStub.callCount).to.equal(1, 'signPayloadStub');
    expect(getRpcStub.callCount).to.equal(0, 'getRpcStub');
    expect(setRpcStub.callCount).to.equal(0, 'setRpcStub');
    expect(clearRpcStub.callCount).to.equal(0, 'clearRpcStub');
  });

  it('should handle tezosGetRpc request', async function () {
    const returnValue = {
      network: 'mainnet',
      rpcUrl: 'https://test.com',
    };

    getRpcStub.restore();
    getRpcStub = sinon
      .stub(getRpcMethods, 'tezosGetRpc')
      .returns(Promise.resolve(returnValue));

    const response = await onRpcRequest(
      getRpcRequestWrapper('tezos_getRpc', exampleParams),
    );

    expect(response).to.deep.equal(returnValue);
    expect(getRpcStub).to.have.been.calledWithExactly();

    expect(getAccountStub.callCount).to.equal(0, 'getAccountStub');
    expect(sendOperationStub.callCount).to.equal(0, 'sendOperationsStub');
    expect(signPayloadStub.callCount).to.equal(0, 'signPayloadStub');
    expect(getRpcStub.callCount).to.equal(1, 'getRpcStub');
    expect(setRpcStub.callCount).to.equal(0, 'setRpcStub');
    expect(clearRpcStub.callCount).to.equal(0, 'clearRpcStub');
  });

  it('should handle tezosSetRpc request', async function () {
    const returnValue = {
      network: 'mainnet',
      rpcUrl: 'https://test.com',
    };

    setRpcStub.restore();
    setRpcStub = sinon
      .stub(setRpcMethods, 'tezosSetRpc')
      .returns(Promise.resolve(returnValue));

    const response = await onRpcRequest(
      getRpcRequestWrapper('tezos_setRpc', exampleParams),
    );

    expect(response).to.deep.equal(returnValue);
    expect(setRpcStub).to.have.been.calledWithExactly(exampleParams);

    expect(getAccountStub.callCount).to.equal(0, 'getAccountStub');
    expect(sendOperationStub.callCount).to.equal(0, 'sendOperationsStub');
    expect(signPayloadStub.callCount).to.equal(0, 'signPayloadStub');
    expect(getRpcStub.callCount).to.equal(0, 'getRpcStub');
    expect(setRpcStub.callCount).to.equal(1, 'setRpcStub');
    expect(clearRpcStub.callCount).to.equal(0, 'clearRpcStub');
  });

  it('should handle tezosClearRpc request', async function () {
    const returnValue = {
      network: 'mainnet',
      rpcUrl: 'https://test.com',
    };

    clearRpcStub.restore();
    clearRpcStub = sinon
      .stub(clearRpcMethods, 'tezosClearRpc')
      .returns(Promise.resolve(returnValue));

    const response = await onRpcRequest(
      getRpcRequestWrapper('tezos_clearRpc', exampleParams),
    );

    expect(response).to.deep.equal(returnValue);
    expect(clearRpcStub).to.have.been.calledWithExactly(exampleParams);

    expect(getAccountStub.callCount).to.equal(0, 'getAccountStub');
    expect(sendOperationStub.callCount).to.equal(0, 'sendOperationsStub');
    expect(signPayloadStub.callCount).to.equal(0, 'signPayloadStub');
    expect(getRpcStub.callCount).to.equal(0, 'getRpcStub');
    expect(setRpcStub.callCount).to.equal(0, 'setRpcStub');
    expect(clearRpcStub.callCount).to.equal(1, 'clearRpcStub');
  });

  it('should reject unknown methods', async function () {
    await expect(
      onRpcRequest(getRpcRequestWrapper('tezos_unknownMethod', {})),
    ).to.be.rejectedWith('Method not found.');
  });
});
