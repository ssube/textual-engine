import { expect } from 'chai';

import { NodeModule } from '../../src/module/NodeModule';
import { getTestContainer } from '../helper';

describe('browser module', () => {
  it('should provide browser services', async () => {
    const module = new NodeModule();
    await getTestContainer(module);

    expect(module.has('node-fetch-loader'), 'has fetch loader').to.equal(true);
    expect(module.has('node-file-loader'), 'has page loader').to.equal(true);
    expect(module.has('node-ink-render'), 'has dom render').to.equal(true);
    expect(module.has('node-line-render'), 'has dom render').to.equal(true);
  });
});
