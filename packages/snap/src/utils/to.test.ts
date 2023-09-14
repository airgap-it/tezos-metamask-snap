import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBytes from 'chai-bytes';
import { to } from './to';

chai.use(chaiBytes);
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Test method: to', function () {
  it('should handle handle resolve', async function () {
    const [err, res] = await to(new Promise((resolve) => resolve('test')));
    expect(err).to.equal(null);
    expect(res).to.contain('test');
  });

  it('should handle reject', async function () {
    const [err, res] = await to(
      new Promise((_resolve, reject) => reject(new Error('test'))),
    );
    expect(err?.message).to.equal('test');
    expect(res).to.equal(undefined);
  });
});
