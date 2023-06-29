import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import * as sinon from 'sinon';
import { SnapMock } from '../../test/snap.mock.test';
import { jsonOk } from '../../test/utils.test';
import { tezosSetRpc } from './set-rpc';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const checkStubs = (
  response: {
    network: string;
    nodeUrl: string;
  },
  data: {
    network: string;
    nodeUrl: string;
  },
  fetchStub: sinon.SinonStub,
  snapStub: SnapMock,
) => {
  expect(response).to.deep.equal(data);
  expect(fetchStub.callCount).to.be.equal(1);
  expect(fetchStub.firstCall.args[0]).to.be.equal(
    `${data.nodeUrl}chains/main/blocks/head/header`,
  );
  expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(1);
  expect(snapStub.rpcStubs.snap_manageState.callCount).to.be.equal(1);
};

const setupStubs = (snapStub: SnapMock) => {
  snapStub.rpcStubs.snap_dialog.resolves(true);
  snapStub.rpcStubs.snap_manageState.resolves();
  const fetchStub = sinon
    .stub(global, 'fetch')
    .returns(jsonOk({ hash: 'op...', chain_id: 'testchain' }));

  return { fetchStub };
};

describe('Test function: setRpc', function () {
  const snapStub = new SnapMock();

  beforeEach(function () {
    (global as any).snap = snapStub;
  });

  afterEach(function () {
    snapStub.reset();
    sinon.restore();
  });

  it('should set a valid RPC', async function () {
    const data = { network: 'mainnet', nodeUrl: 'https://test.com/' };
    const { fetchStub } = setupStubs(snapStub);

    const response = await tezosSetRpc(data);

    checkStubs(response, data, fetchStub, snapStub);

    expect(snapStub.rpcStubs.snap_manageState.firstCall.args[0]).to.deep.equal({
      operation: 'update',
      newState: { rpc: data },
    });
  });

  it('should set a valid RPC and normalize the URL', async function () {
    const data = { network: 'mainnet', nodeUrl: 'https://test.com' };
    const { fetchStub } = setupStubs(snapStub);

    const response = await tezosSetRpc(data);

    checkStubs(response, data, fetchStub, snapStub);

    expect(snapStub.rpcStubs.snap_manageState.firstCall.args[0]).to.deep.equal({
      operation: 'update',
      newState: { rpc: { ...data, nodeUrl: `${data.nodeUrl}/` } },
    });
  });

  it('should reject non https URLs', async function () {
    const data = { network: 'mainnet', nodeUrl: 'http://test.com' };
    snapStub.rpcStubs.snap_dialog.resolves(true);
    snapStub.rpcStubs.snap_manageState.resolves();
    const fetchStub = sinon
      .stub(global, 'fetch')
      .returns(jsonOk({ hash: 'op...', chain_id: 'testchain' }));

    await expect(tezosSetRpc(data)).to.be.rejectedWith(
      'RPC URL needs to start with https://',
    );

    expect(fetchStub.callCount).to.be.equal(0);
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(0);
    expect(snapStub.rpcStubs.snap_manageState.callCount).to.be.equal(0);
  });

  it('should not share the RPC if the user rejects the dialog', async function () {
    const data = { network: 'mainnet', nodeUrl: 'https://test.com' };

    snapStub.rpcStubs.snap_dialog.resolves(false);

    const fetchStub = sinon
      .stub(global, 'fetch')
      .returns(jsonOk({ hash: 'op...', chain_id: 'testchain' }));

    expect(tezosSetRpc(data)).to.be.rejectedWith('User rejected');

    expect(fetchStub.callCount).to.be.equal(1, 'fetchStub');
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(0);
    expect(snapStub.rpcStubs.snap_manageState.callCount).to.be.equal(0);
  });

  it('should fail when fetching from invalid RPC url', async function () {
    const data = { network: 'mainnet', nodeUrl: 'https://test.com' };

    snapStub.rpcStubs.snap_dialog.resolves(false);

    const fetchStub = sinon
      .stub(global, 'fetch')
      .returns(jsonOk({ test: '123' }));

    expect(tezosSetRpc(data)).to.be.rejectedWith('Invalid RPC URL');

    expect(fetchStub.callCount).to.be.equal(1, 'fetchStub');
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(0);
    expect(snapStub.rpcStubs.snap_manageState.callCount).to.be.equal(0);
  });

  it('should fail with invalid RPC url', async function () {
    const data = { network: 'mainnet', nodeUrl: 'https://test.com' };

    snapStub.rpcStubs.snap_dialog.resolves(false);

    const fetchStub = sinon
      .stub(global, 'fetch')
      .rejects(new Error('Invalid RPC URL'));

    expect(tezosSetRpc(data)).to.be.rejectedWith('Invalid RPC URL');

    expect(fetchStub.callCount).to.be.equal(1, 'fetchStub');
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(0);
    expect(snapStub.rpcStubs.snap_manageState.callCount).to.be.equal(0);
  });
});
