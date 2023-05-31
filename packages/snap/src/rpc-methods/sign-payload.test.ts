import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import * as sinon from 'sinon';
import * as getWalletMethods from '../utils/get-wallet';
import * as signMethods from '../utils/sign';
import { SnapMock } from '../../test/snap.mock.test';
import { bip32Entropy } from '../../test/constants.test';
import { tezosSignPayload } from './sign-payload';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const data = {
  signature: {
    bytes: '00',
    sig: 'sig...',
    prefixSig: 'edsig...',
    sbytes: '00',
  },
};

describe('Test function: signPayload', function () {
  const snapStub = new SnapMock();

  beforeEach(function () {
    (global as any).snap = snapStub;
  });

  afterEach(function () {
    snapStub.reset();
    sinon.restore();
  });

  it('should accept a sign payload request', async function () {
    const signStub = sinon
      .stub(signMethods, 'sign')
      .returns(Promise.resolve(data));

    const walletMethodStub = sinon
      .stub(getWalletMethods, 'getWallet')
      .returns(Promise.resolve({ ed25519: bip32Entropy } as any));

    snapStub.rpcStubs.snap_dialog.resolves(true);

    const response = await tezosSignPayload({ payload: { test: 123 } });

    expect(response).to.deep.equal(data);
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(1);
    expect(walletMethodStub.callCount).to.be.equal(1);
    expect(signStub.callCount).to.be.equal(1);
  });

  it('should not sign a payload if the user rejects the dialog', async function () {
    snapStub.rpcStubs.snap_dialog.resolves(false);

    const signStub = sinon
      .stub(signMethods, 'sign')
      .returns(Promise.resolve(data));

    const walletMethodStub = sinon
      .stub(getWalletMethods, 'getWallet')
      .returns(Promise.resolve({ ed25519: bip32Entropy } as any));

    await expect(
      tezosSignPayload({ payload: { test: 123 } }),
    ).to.be.rejectedWith('User rejected');
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(1);
    expect(walletMethodStub.callCount).to.be.equal(1);
    expect(signStub.callCount).to.be.equal(0);
  });
});
