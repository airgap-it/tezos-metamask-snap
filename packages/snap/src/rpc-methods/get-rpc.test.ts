import chai, { expect } from 'chai';
import { tezosGetRpc } from './get-rpc';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import * as sinon from 'sinon';
import * as getRpcMethods from '../utils/get-rpc';
import { SnapMock } from '../../test/snap.mock.test';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: getRpc', function () {
  const snapStub = new SnapMock();

  beforeEach(function () {
    (global as any).snap = snapStub;
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should share the RPC if the user accepts the dialog', async function () {
    const data = { network: 'mainnet', nodeUrl: 'https://test.com/' };
    sinon.stub(getRpcMethods, 'getRpc').returns(Promise.resolve(data));

    snapStub.rpcStubs.snap_dialog.resolves(true);

    const response = await tezosGetRpc();

    expect(response.network).to.equal(data.network);
    expect(response.nodeUrl).to.equal(data.nodeUrl);
  });

  it('should not share the RPC if the user rejects the dialog', async function () {
    sinon
      .stub(getRpcMethods, 'getRpc')
      .returns(
        Promise.resolve({ network: 'mainnet', nodeUrl: 'https://test.com/' }),
      );

    snapStub.rpcStubs.snap_dialog.resolves(false);

    await expect(tezosGetRpc()).to.be.rejectedWith('User rejected');
  });
});
