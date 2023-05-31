import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import * as sinon from 'sinon';
import { SnapMock } from '../../test/snap.mock.test';
import { DEFAULT_NODE_URL } from '../constants';
import { tezosClearRpc } from './clear-rpc';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: clearRpc', function () {
  const snapStub = new SnapMock();

  beforeEach(function () {
    (global as any).snap = snapStub;
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should clear the RPC if the user accepts the dialog', async function () {
    const data = { network: 'mainnet', nodeUrl: DEFAULT_NODE_URL };

    snapStub.rpcStubs.snap_dialog.resolves(true);
    snapStub.rpcStubs.snap_manageState.resolves();

    const response = await tezosClearRpc();

    expect(response.network).to.equal(data.network);
    expect(response.nodeUrl).to.equal(data.nodeUrl);
    expect(snapStub.rpcStubs.snap_manageState.callCount).to.be.equal(1);
    expect(snapStub.rpcStubs.snap_manageState.firstCall.args[0]).to.deep.equal({
      operation: 'clear',
    });
  });

  it('should not clear the RPC if the user rejects the dialog', async function () {
    snapStub.rpcStubs.snap_dialog.resolves(false);

    await expect(tezosClearRpc()).to.be.rejectedWith('User rejected');
  });
});
