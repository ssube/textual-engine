import { expect } from 'chai';
import { Container } from 'noicejs';

import { FileLoader } from '../../../src/service/loader/FileLoader';

describe('file loader', () => {
  it('should read from paths', async () => {
    const container = Container.from();
    await container.configure();

    const loader = await container.create(FileLoader);
    return expect(loader.loadStr('README.md')).to.eventually.include('Textual Engine');
  });

  // TODO: use a mock filesystem
  it('should write to paths', async () => {
    const container = Container.from();
    await container.configure();

    const loader = await container.create(FileLoader);
    const path = 'out/test.md';
    await loader.saveStr(path, 'foo');

    return expect(loader.loadStr(path)).to.eventually.include('foo');
  });

  // TODO: use a mock filesystem
  it('should round-trip binary data', async () => {
    const container = Container.from();
    await container.configure();

    const loader = await container.create(FileLoader);
    const data = Buffer.from('foo\0');
    const path = 'out/test.bin';
    await loader.save(path, data);

    return expect(loader.load(path)).to.eventually.deep.equal(data);
  });
});

