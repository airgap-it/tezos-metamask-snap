import BigNumber from 'bignumber.js';
import chai, { expect } from 'chai';
import { injectTransaction } from './inject-transaction';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import * as sinon from 'sinon';
import { jsonOk } from '../../test/utils.test';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: injectTransaction', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should inject a transaction', async function () {
    const fetchStub = sinon.stub(global, 'fetch').returns(jsonOk('op...'));

    const response = await injectTransaction(
      'rawTxPayload',
      'https://test.com/',
    );

    expect(response).to.equal('op...');
    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[0]).to.deep.equal(
      'https://test.com/injection/operation?chain=main',
    );
    expect(fetchStub.firstCall.args[1]?.method).to.deep.equal('POST');
    expect(fetchStub.firstCall.args[1]?.body).to.deep.equal('"rawTxPayload"');
  });

  it('should throw an error', async function () {
    const fetchStub = sinon
      .stub(global, 'fetch')
      .rejects(new Error('Node returned an error'));

    await expect(
      injectTransaction('invalidPayload', 'https://test.com/'),
    ).to.be.rejectedWith('Node returned an error');

    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[0]).to.deep.equal(
      'https://test.com/injection/operation?chain=main',
    );
    expect(fetchStub.firstCall.args[1]?.method).to.deep.equal('POST');
    expect(fetchStub.firstCall.args[1]?.body).to.deep.equal('"invalidPayload"');
  });
});
