import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import * as sinon from 'sinon';
import { jsonOk } from '../../test/utils.test';
import { getBalanceOfAddress } from './get-balance-of-address';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: getBalanceOfAddress', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should fetch the balance of an address', async function () {
    const fetchStub = sinon.stub(global, 'fetch').returns(jsonOk('1000000'));

    const response = await getBalanceOfAddress('tz1...', 'https://test.com/');

    expect(response).to.equal('1000000');
    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[0]).to.deep.equal(
      'https://test.com/chains/main/blocks/head/context/contracts/tz1.../balance',
    );
  });

  it('should return 0 balance for unknown address', async function () {
    const fetchStub = sinon
      .stub(global, 'fetch')
      .rejects(new Error('Address does not exist'));

    const response = await getBalanceOfAddress(
      'tz1unknown...',
      'https://test.com/',
    );

    expect(response).to.equal('0');
    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[0]).to.deep.equal(
      'https://test.com/chains/main/blocks/head/context/contracts/tz1unknown.../balance',
    );
  });

  it('should return return an error if response is not 200 or 404', async function () {
    const fetchStub = sinon
      .stub(global, 'fetch')
      .rejects({ response: { status: 500 } });

    await expect(
      getBalanceOfAddress('tz1...', 'https://test.com/'),
    ).to.be.rejectedWith('Error fetching balance');

    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[0]).to.deep.equal(
      'https://test.com/chains/main/blocks/head/context/contracts/tz1.../balance',
    );
  });
});
