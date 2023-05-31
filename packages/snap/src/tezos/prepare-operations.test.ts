import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import * as sinon from 'sinon';
import { jsonOk } from '../../test/utils.test';
import { DEFAULT_NODE_URL } from '../constants';
import { prepareOperations } from './prepare-operations';
import { TezosOperationType, TezosTransactionOperation } from './types';
import * as estimateFeeMethods from './estimate-fee';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test function: sendOperation', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should prepare an operation', async function () {
    const address = 'tz1UNer1ijeE9ndjzSszRduR3CzX49hoBUB3';
    const blockHash = 'BLbfxzLVe4Wu25Wmz3MoDWp8c6HmEwKxfR3MC86FHiK12zNp4WK';

    const fetchStub = sinon
      .stub(global, 'fetch')
      .withArgs(
        `${DEFAULT_NODE_URL}chains/main/blocks/head/context/contracts/${address}/counter`,
      )
      .returns(jsonOk('13186806'))
      .withArgs(`${DEFAULT_NODE_URL}chains/main/blocks/head~2/hash`)
      .returns(jsonOk(blockHash))
      .withArgs(
        `${DEFAULT_NODE_URL}chains/main/blocks/head/context/contracts/${address}/manager_key`,
      )
      .returns(
        jsonOk('edpkuwYWCugiYG7nMnVUdopFmyc3sbMSiLqsJHTQgGtVhtSdLSw6HG'),
      );

    const feeStub = sinon
      .stub(estimateFeeMethods, 'estimateAndReplaceLimitsAndFee')
      .returns(
        Promise.resolve({
          branch: 'BLbfxzLVe4Wu25Wmz3MoDWp8c6HmEwKxfR3MC86FHiK12zNp4WK',
          contents: [
            {
              kind: 'transaction',
              amount: '1',
              destination: 'tz1UNer1ijeE9ndjzSszRduR3CzX49hoBUB3',
              source: 'tz1UNer1ijeE9ndjzSszRduR3CzX49hoBUB3',
              counter: '13186807',
              fee: '454',
              gas_limit: '1001',
              storage_limit: '0',
            } as TezosTransactionOperation,
          ],
        }),
      );

    const response = await prepareOperations(
      address,
      'edpkuwYWCugiYG7nMnVUdopFmyc3sbMSiLqsJHTQgGtVhtSdLSw6HG',
      [
        {
          kind: TezosOperationType.TRANSACTION,
          amount: '1',
          destination: address,
        } as TezosTransactionOperation,
      ],
      DEFAULT_NODE_URL,
    );

    expect(response).to.equal(
      '74b00cb4900aba5612890c2e794955137e4291a14d79c43dd5803bb4085e4abd6c005fd0a7ece135cecfd71fcf78cf6656d5047fb980c603f7eda406e907000100005fd0a7ece135cecfd71fcf78cf6656d5047fb98000',
    );
    expect(fetchStub.callCount).to.equal(1); // Why is this only 1?
    expect(fetchStub.firstCall.args[0]).to.deep.equal(
      'https://tezos-node.prod.gke.papers.tech/chains/main/blocks/head/context/contracts/tz1UNer1ijeE9ndjzSszRduR3CzX49hoBUB3/manager_key',
    );
    expect(feeStub.callCount).to.equal(1);
  });
});
