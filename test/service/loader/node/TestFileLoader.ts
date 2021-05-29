import { expect } from 'chai';
import { LocalModule } from '../../../../src/module/LocalModule';

import { NodeFileLoader } from '../../../../src/service/loader/node/FileLoader';
import { getTestContainer } from '../../../helper';

describe('file loader', () => {
  it('should read from paths', async () => {
    const container = await getTestContainer(new LocalModule());

    const loader = await container.create(NodeFileLoader);
    return expect(loader.loadStr('README.md')).to.eventually.include('Textual Engine');
  });

  // TODO: use a mock filesystem
  it('should write to paths', async () => {
    const container = await getTestContainer(new LocalModule());

    const loader = await container.create(NodeFileLoader);
    const path = 'out/test.md';
    await loader.saveStr(path, 'foo');

    return expect(loader.loadStr(path)).to.eventually.include('foo');
  });

  // TODO: use a mock filesystem
  it('should round-trip binary data', async () => {
    const container = await getTestContainer(new LocalModule());

    const loader = await container.create(NodeFileLoader);
    const data = Buffer.from('foo\0');
    const path = 'out/test.bin';
    await loader.save(path, data);

    return expect(loader.load(path)).to.eventually.deep.equal(data);
  });
});

