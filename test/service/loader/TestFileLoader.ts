import { expect } from 'chai';
import { Container } from 'noicejs';

import { FileLoader } from '../../../src/service/loader/FileLoader';

describe('file logger', () => {
  it('should read from paths', async () => {
    const loader = new FileLoader({
      container: Container.from(),
    });

    await expect(loader.loadStr('README.md')).to.eventually.include('Textual Engine');
  });
});

