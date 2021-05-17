import { expect } from 'chai';
import { LogLevel } from 'noicejs';

import { BunyanLogger } from '../../src/logger/BunyanLogger';

describe('bunyan logger', () => {
  it('should create children', async () => {
    const logger = BunyanLogger.create({
      level: LogLevel.INFO,
      name: 'test',
    });

    expect(logger.child({})).to.have.property('debug');
  });
});
