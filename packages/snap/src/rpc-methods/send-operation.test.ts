import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import * as sinon from 'sinon';
import * as getWalletMethods from '../utils/get-wallet';
import * as getRpcMethods from '../utils/get-rpc';
import * as prepareAndSignMethods from '../utils/prepare-and-sign';
import { SnapMock } from '../../test/snap.mock.test';
import { bip32Entropy } from '../../test/constants.test';
import { tezosSendOperation } from './send-operation';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: sendOperation', function () {
  const snapStub = new SnapMock();

  beforeEach(function () {
    (global as any).snap = snapStub;
  });

  afterEach(function () {
    snapStub.reset();
    sinon.restore();
  });

  it('should share the account', async function () {
    const data = {
      opHash: 'op...',
    };

    const getRpcStub = sinon
      .stub(getRpcMethods, 'getRpc')
      .returns(
        Promise.resolve({ network: 'mainnet', nodeUrl: 'https://test.com/' }),
      );

    const prepareStub = sinon
      .stub(prepareAndSignMethods, 'prepareAndSign')
      .returns(Promise.resolve('op...'));

    const walletMethodStub = sinon
      .stub(getWalletMethods, 'getWallet')
      .returns(Promise.resolve({ ed25519: bip32Entropy } as any));

    snapStub.rpcStubs.snap_dialog.resolves(true);

    const response = await tezosSendOperation('http://localhost:1234', {
      payload: { test: 123 },
    });

    expect(response.opHash).to.equal(data.opHash);
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(1);
    expect(walletMethodStub.callCount).to.be.equal(1);
    expect(getRpcStub.callCount).to.be.equal(1);
    expect(prepareStub.callCount).to.be.equal(1);
  });

  it('should not share the account if the user rejects the dialog', async function () {
    snapStub.rpcStubs.snap_dialog.resolves(false);

    const getRpcStub = sinon
      .stub(getRpcMethods, 'getRpc')
      .returns(
        Promise.resolve({ network: 'mainnet', nodeUrl: 'https://test.com/' }),
      );

    const prepareStub = sinon
      .stub(prepareAndSignMethods, 'prepareAndSign')
      .returns(Promise.resolve('op...'));

    const walletMethodStub = sinon
      .stub(getWalletMethods, 'getWallet')
      .returns(Promise.resolve({ ed25519: bip32Entropy } as any));

    await expect(
      tezosSendOperation('http://localhost:1234', { payload: { test: 123 } }),
    ).to.be.rejectedWith('User rejected');
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(1);
    expect(walletMethodStub.callCount).to.be.equal(1);
    expect(getRpcStub.callCount).to.be.equal(1);
    expect(prepareStub.callCount).to.be.equal(0);
  });
});
