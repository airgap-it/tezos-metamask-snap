import chai, { expect } from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import { prepareAndSign } from './prepare-and-sign';
import { bip32Entropy } from '../../test/constants.test';
import { DEFAULT_RPC_URL } from '../constants';
import * as prepareOperationMethods from '../tezos/prepare-operations';
import * as injectTransactionMethods from '../tezos/inject-transaction';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: prepareAndSign', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should sign operations', async function () {
    const prepareOperationStub = sinon
      .stub(prepareOperationMethods, 'prepareOperations')
      .returns(Promise.resolve('0300aaff'));
    const injectTransactionStub = sinon
      .stub(injectTransactionMethods, 'injectTransaction')
      .returns(Promise.resolve('op...'));

    const hash = await prepareAndSign(
      [],
      { ed25519: bip32Entropy },
      DEFAULT_RPC_URL,
    );

    expect(hash).to.equal('op...');

    expect(prepareOperationStub.callCount).to.equal(1);
    expect(injectTransactionStub.callCount).to.equal(1);
    expect(prepareOperationStub.firstCall.args[0]).to.deep.equal(
      'tz1bQrTEReXZKRwZWBy7gAJqbNCvrzqXzY1J',
    );
    expect(prepareOperationStub.firstCall.args[1]).to.deep.equal(
      'edpkvRupRPuHmoUx2zMgbDibs4KMD6ZwqEp6PePzSwhKkQ6pVxoU3u',
    );
    expect(prepareOperationStub.firstCall.args[2]).to.deep.equal([]);
    expect(prepareOperationStub.firstCall.args[3]).to.deep.equal(
      'https://tezos-node.prod.gke.papers.tech/',
    );
    expect(injectTransactionStub.firstCall.args[0]).to.deep.equal(
      '0300aaff4d81b9c84f8e12c12b1ba78c1b3a1e438080e851fee2110b3a82dc85d9d944433c602f83a7c58fa7227ee5ba9d24204cb97fa318b3030fc01a341369ff405805',
    );
    expect(injectTransactionStub.firstCall.args[1]).to.deep.equal(
      'https://tezos-node.prod.gke.papers.tech/',
    );
  });
});
