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
    snapStub.rpcStubs.snap_dialog.resolves(true);
    snapStub.rpcStubs.snap_manageState.resolves();
    const fetchStub = sinon
      .stub(global, 'fetch')
      .returns(jsonOk({ hash: 'op...', chain_id: 'testchain' }));

    const response = await tezosSetRpc(data);

    expect(response).to.deep.equal(data);
    expect(fetchStub.callCount).to.be.equal(1);
    expect(fetchStub.firstCall.args[0]).to.be.equal(
      `${data.nodeUrl}chains/main/blocks/head/header`,
    );
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(1);
    expect(snapStub.rpcStubs.snap_manageState.callCount).to.be.equal(1);
    expect(snapStub.rpcStubs.snap_manageState.firstCall.args[0]).to.deep.equal({
      operation: 'update',
      newState: { rpc: data },
    });
  });

  it('should set a valid RPC and normalize the URL', async function () {
    const data = { network: 'mainnet', nodeUrl: 'https://test.com' };
    snapStub.rpcStubs.snap_dialog.resolves(true);
    snapStub.rpcStubs.snap_manageState.resolves();
    const fetchStub = sinon
      .stub(global, 'fetch')
      .returns(jsonOk({ hash: 'op...', chain_id: 'testchain' }));

    const response = await tezosSetRpc(data);

    expect(response).to.deep.equal(data);
    expect(fetchStub.callCount).to.be.equal(1);
    expect(fetchStub.firstCall.args[0]).to.be.equal(
      `${data.nodeUrl}/chains/main/blocks/head/header`,
    );
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(1);
    expect(snapStub.rpcStubs.snap_manageState.callCount).to.be.equal(1);
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
});
