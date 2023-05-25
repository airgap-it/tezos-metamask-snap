import chai, { expect } from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import { sign } from './sign';
import { bip32Entropy } from '../../test/constants.test';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: sign', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should sign a payload', async function () {
    const signature = await sign('001234', undefined, {
      ed25519: bip32Entropy,
    });

    expect(signature).to.deep.equal({
      signature: {
        bytes: '001234',
        sig: 'sigc7gxhcgk5ebnHvWj9Yzkq3WzuyqGsrdftnEJL9nkNVNr5n2gFZUydTN2WcLzFxz99ArUJCW74EwSXWAjutfWe14YNYzFB',
        prefixSig:
          'edsigtmwA5kqb21qdqUuosBQBi8L2mk4mFWjE3aXy2g9mkiWL9uidB9Ua4ghH57E95j9LageUPoyrwgCiBKYNQ4Edhh5ASYX3Pt',
        sbytes:
          '0012346bfc21ccd870a11a420faa0fe53f71e67c54703ed1f5475cabaaffd7a8387940c28575a8c7db83abf4adb4b8cdfc1e9777d1b355d32651969ccdff6cd4cb9207',
      },
    });
  });

  it('should sign a payload with watermark', async function () {
    const signature = await sign('001234', new Uint8Array([3]), {
      ed25519: bip32Entropy,
    });

    expect(signature).to.deep.equal({
      signature: {
        bytes: '001234',
        sig: 'sigbVnq8LG5wAPJzLrVV6TxNbYk6MyVEtQAJJtZcfBvAcLGK2Jw7GbUiNmdm5uTayQ8KfMKDPP7RgReoPxugqmy12V62mvz8',
        prefixSig:
          'edsigtmKFxBZAMsMRNBL9dWweuft4WvSuTskzXz4dHxfAvWdHa8xuS1BgZmcggMhhZ49kZs8yEjAjx3eCPbSAZqBkA46b2eWxkH',
        sbytes:
          '0012346741014c148ba97f86ba53e3bf12570266c10f7c28db65b1954e715ec4a2bde8e9a0ed82554652038a2a90ce0627dd43eebfd3660d54150580c98d75a5fbe70d',
      },
    });
  });
});
