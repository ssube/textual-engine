import { expect } from 'chai';

import { ConfigError } from '../../../src/error/ConfigError.js';
import { loadConfig } from '../../../src/util/config/file.js';

describe('file config', () => {
  /**
   * small/unit tests should not normally use real files, but this
   * is a convenient way to validate some of the demo data
   */
  it('should validate the demo config', async () => {
    const data = await loadConfig('data/config.yml');

    expect(data.logger.name).to.equal('textual-engine');
  });

  it('should throw when loading data files', async () =>
    expect(loadConfig('data/demo.yml')).to.eventually.be.rejectedWith(ConfigError)
  );

  it('should throw when invalid config', async () =>
    expect(loadConfig('data/invalid.yml')).to.eventually.be.rejectedWith(ConfigError)
  );
});
