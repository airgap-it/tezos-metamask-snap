import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import * as sinon from 'sinon';
import * as getSignerMethods from '../utils/get-signer';
import * as getWalletMethods from '../utils/get-wallet';
import { SnapMock } from '../../test/snap.mock.test';
import { bip32Entropy } from '../../test/constants.test';
import { tezosGetAccount } from './get-account';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: getAccount', function () {
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
      curve: 'ed25519',
      publicKey: 'edpkvRupRPuHmoUx2zMgbDibs4KMD6ZwqEp6PePzSwhKkQ6pVxoU3u',
      address: 'tz1bQrTEReXZKRwZWBy7gAJqbNCvrzqXzY1J',
    };

    const walletMethodStub = sinon
      .stub(getWalletMethods, 'getWallet')
      .returns(Promise.resolve({ ed25519: bip32Entropy } as any));

    const signerMethodStub = sinon.stub(getSignerMethods, 'getSigner').returns(
      Promise.resolve({
        publicKey: () =>
          Promise.resolve(
            'edpkvRupRPuHmoUx2zMgbDibs4KMD6ZwqEp6PePzSwhKkQ6pVxoU3u',
          ),
        publicKeyHash: () =>
          Promise.resolve('tz1bQrTEReXZKRwZWBy7gAJqbNCvrzqXzY1J'),
      } as any),
    );

    snapStub.rpcStubs.snap_dialog.resolves(true);

    const response = await tezosGetAccount('localhost');

    expect(response.curve).to.equal(data.curve);
    expect(response.address).to.equal(data.address);
    expect(response.publicKey).to.equal(data.publicKey);
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(1);
    expect(walletMethodStub.callCount).to.be.equal(1);
    expect(signerMethodStub.callCount).to.be.equal(1);
  });

  it('should not share the account if the user rejects the dialog', async function () {
    snapStub.rpcStubs.snap_dialog.resolves(false);

    const walletMethodStub = sinon
      .stub(getWalletMethods, 'getWallet')
      .returns(Promise.resolve({ ed25519: bip32Entropy } as any));

    const signerMethodStub = sinon.stub(getSignerMethods, 'getSigner').returns(
      Promise.resolve({
        publicKey: () =>
          Promise.resolve(
            'edpkvRupRPuHmoUx2zMgbDibs4KMD6ZwqEp6PePzSwhKkQ6pVxoU3u',
          ),
        publicKeyHash: () =>
          Promise.resolve('tz1bQrTEReXZKRwZWBy7gAJqbNCvrzqXzY1J'),
      } as any),
    );

    await expect(tezosGetAccount('localhost')).to.be.rejectedWith(
      'User rejected',
    );
    expect(snapStub.rpcStubs.snap_dialog.callCount).to.be.equal(1);
    expect(walletMethodStub.callCount).to.be.equal(1);
    expect(signerMethodStub.callCount).to.be.equal(1);
  });
});
