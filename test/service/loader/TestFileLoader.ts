import { expect } from 'chai';
import { Container } from 'noicejs';

import { FileLoader } from '../../../src/service/loader/FileLoader';

describe('file loader', () => {
  it('should read from paths', async () => {
    const loader = new FileLoader({
      container: Container.from(),
    });

    await expect(loader.loadStr('README.md')).to.eventually.include('Textual Engine');
  });

  // TODO: use a mock filesystem
  it('should write to paths', async () => {
    const loader = new FileLoader({
      container: Container.from(),
    });

    const path = 'out/test.md';
    await loader.saveStr(path, 'foo');

    await expect(loader.loadStr(path)).to.eventually.include('foo');
  });

  // TODO: use a mock filesystem
  it('should round-trip binary data', async () => {
    const loader = new FileLoader({
      container: Container.from(),
    });

    const data = Buffer.from('foo\0');
    const path = 'out/test.bin';
    await loader.save(path, data);

    await expect(loader.load(path)).to.eventually.deep.equal(data);
  });
});

