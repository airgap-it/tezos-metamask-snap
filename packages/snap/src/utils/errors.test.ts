import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';

import {
  NETWORK_ERROR,
  PROPERTY_NOT_DEFINED_WITH_DATA_ERROR,
  TEZOS_INTERNAL_OP_COUNT_MISMATCH_ERROR,
  TEZOS_OPERATION_ERROR,
  UNSUPPORTED_OPERATION_KIND_ERROR,
} from './errors';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test file: errors', function () {
  it('should return errors', async function () {
    {
      const error = TEZOS_OPERATION_ERROR({});
      expect(error.message).to.contain('The operation produced an error');
    }

    {
      const error = TEZOS_INTERNAL_OP_COUNT_MISMATCH_ERROR(1, 2);
      expect(error.message).to.contain(
        'Run Operation did not return same number of operations. Locally we have',
      );
    }

    {
      const error = PROPERTY_NOT_DEFINED_WITH_DATA_ERROR('prop', {});
      expect(error.message).to.contain('was not defined');
    }

    {
      const error = UNSUPPORTED_OPERATION_KIND_ERROR('prop');
      expect(error.message).to.contain('unsupported operation type');
    }

    {
      const error = NETWORK_ERROR('err');
      expect(error.message).to.contain('Network error: ');
    }
  });
});
