import { expect } from 'chai';

import { ConfigError, loadConfig } from '../../src/util/config';

describe('config utils', () => {
  /**
   * small/unit tests should not normally use real files, but this
   * is a convenient way to validate some of the demo data
   */
  it('should validate the demo config', async () => {
    const data = await loadConfig('data/config.yml');

    expect(data.logger.name).to.equal('textual-engine');
  });

  it('should throw when loading data files', async () =>
    expect(loadConfig('data/base.yml')).to.eventually.be.rejectedWith(ConfigError)
  );
});

