import { NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { stub } from 'sinon';
import { CoreModule } from '../../../../src/module/CoreModule';

import { NodeFetchLoader } from '../../../../src/service/loader/node/FetchLoader';
import { getTestContainer } from '../../../helper';

describe('fetch loader', () => {
  it('should read from URLs', async () => {
    const container = await getTestContainer(new CoreModule());

    const payload = 'foo';
    const fetch = stub().returns({
      text: () => Promise.resolve(payload),
    });
    const loader = await container.create(NodeFetchLoader, {}, fetch);

    await expect(loader.loadStr('README.md')).to.eventually.equal(payload);
    await expect(loader.load('README.md')).to.eventually.deep.equal(Buffer.from(payload));
  });

  it('should not implement save', async () => {
    const container = await getTestContainer(new CoreModule());

    const fetch = stub();
    const loader = await container.create(NodeFetchLoader, {}, fetch);
    const path = 'out/test.md';

    await expect(loader.save(path, Buffer.from('foo'))).to.eventually.be.rejectedWith(NotImplementedError);
    await expect(loader.saveStr(path, 'foo')).to.eventually.be.rejectedWith(NotImplementedError);
  });
});
