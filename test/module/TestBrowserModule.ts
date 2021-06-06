import { expect } from 'chai';

import { BrowserModule } from '../../src/module/BrowserModule';
import { getTestContainer } from '../helper';

describe('browser module', () => {
  it('should provide browser services', async () => {
    const module = new BrowserModule();
    await getTestContainer(module);

    expect(module.has('browser-fetch-loader'), 'has fetch loader').to.equal(true);
    expect(module.has('browser-page-loader'), 'has page loader').to.equal(true);
    expect(module.has('browser-dom-render'), 'has dom render').to.equal(true);
  });
});
