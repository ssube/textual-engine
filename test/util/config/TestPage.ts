import { expect } from 'chai';
import { LogLevel } from 'noicejs';
import { stub } from 'sinon';

import { loadConfig } from '../../../src/util/config/page';

describe('page config', () => {
  it('should load config from element text', async () => {
    const doc = {
      getElementById: stub().returns({
        textContent: `
logger:
  level: debug
  name: test
  streams: []
locale:
  bundles: {}
  current: en
  verbs: []
services:
  actors: []
  loaders: []
  renders: []
  states: []`,
      }),
    } as any;
    const config = await loadConfig('foo', doc);
    expect(config).to.deep.include({
      logger: {
        level: LogLevel.Debug,
        name: 'test',
        streams: [],
      },
    });
    expect(doc.getElementById).to.have.callCount(1);
  });
});
