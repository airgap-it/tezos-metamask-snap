import chai, { expect } from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import { bip32Entropy } from '../../test/constants.test';
import { getSigner } from './get-signer';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

// Test mnemonic: silver kit hat street rug giraffe prosper cruel salon blade caution street
describe('Test function: getSigner', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should return InMemorySigner', async function () {
    const signer = await getSigner({ ed25519: bip32Entropy });

    expect(await signer.publicKey()).to.be.equal(
      'edpkvRupRPuHmoUx2zMgbDibs4KMD6ZwqEp6PePzSwhKkQ6pVxoU3u',
    );

    expect(await signer.publicKeyHash()).to.be.equal(
      'tz1bQrTEReXZKRwZWBy7gAJqbNCvrzqXzY1J',
    );
  });

  it('should fail if invalid sk is provided', async function () {
    await expect(
      getSigner({ ed25519: { privateKey: '0123456789' } }),
    ).to.be.rejectedWith(
      'The key FJ37EiLZZDBcHpvq is invalid. Unsupported key type',
    );
  });
});
