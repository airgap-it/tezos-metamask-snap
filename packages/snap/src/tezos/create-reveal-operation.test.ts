import BigNumber from 'bignumber.js';
import chai, { expect } from 'chai';
import { createRevealOperation } from './create-reveal-operation';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: getRpc', function () {
  it('should create reveal operation', async function () {
    const reveal = await createRevealOperation(
      new BigNumber(5),
      'edpk...',
      'tz1...',
    );
    expect(reveal).to.deep.equal({
      counter: '5',
      fee: '1300',
      gas_limit: '10000',
      kind: 'reveal',
      public_key: 'edpk...',
      source: 'tz1...',
      storage_limit: '0',
    });
  });

  it('should create reveal operation with a custom fee', async function () {
    const reveal = await createRevealOperation(
      new BigNumber(5),
      'edpk...',
      'tz1...',
      '1000',
    );
    expect(reveal).to.deep.equal({
      counter: '5',
      fee: '1000',
      gas_limit: '10000',
      kind: 'reveal',
      public_key: 'edpk...',
      source: 'tz1...',
      storage_limit: '0',
    });
  });
});
