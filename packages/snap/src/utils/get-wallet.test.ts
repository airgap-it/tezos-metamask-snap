import chai, { expect } from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import { getWallet } from './get-wallet';
import { SnapMock } from '../../test/snap.mock.test';
import { bip32Entropy } from '../../test/constants.test';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: getWallet', function () {
  const snapStub = new SnapMock();

  beforeEach(async function () {
    (global as any).snap = snapStub;
  });

  afterEach(function () {
    snapStub.reset();
    sinon.restore();
  });

  it('should return the wallet', async function () {
    snapStub.rpcStubs.snap_getBip32Entropy.resolves(bip32Entropy);

    const wallet = await getWallet();
    expect(wallet).to.deep.equal({ ed25519: bip32Entropy });

    expect(snapStub.rpcStubs.snap_getBip32Entropy.callCount).to.equal(1);
    expect(
      snapStub.rpcStubs.snap_getBip32Entropy.firstCall.args[0],
    ).to.deep.equal({
      path: ['m', "44'", "1729'", "0'", "0'"],
      curve: 'ed25519',
    });
  });
});
