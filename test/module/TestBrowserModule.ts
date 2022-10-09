import { expect } from 'chai';

import { BrowserModule } from '../../src/module/BrowserModule.js';
import { getTestContainer } from '../helper.js';

describe('browser module', () => {
  it('should provide browser services', async () => {
    const module = new BrowserModule();
    await getTestContainer(module);

    expect(module.has('browser-fetch-loader'), 'has fetch loader').to.equal(true);
    expect(module.has('browser-page-loader'), 'has page loader').to.equal(true);
    expect(module.has('browser-dom-render'), 'has dom render').to.equal(true);
  });
});
