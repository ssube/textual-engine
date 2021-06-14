import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { LogLevel } from 'noicejs';
import { stub } from 'sinon';
import { ConfigError } from '../../../src/lib';

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

  it('should throw when element cannot be found', async () => {
    const doc = {
      getElementById: stub().returns(undefined),
    } as any;
    return expect(loadConfig('foo', doc)).to.eventually.be.rejectedWith(NotFoundError);
  });

  it('should throw when config is not valid', async () => {
    const doc = {
      getElementById: stub().returns({
        textContent: `
logger: {}
locale: {}
services:
  actors: []
  loaders: []
  renders: []
  states: []`,
      }),
    } as any;
    return expect(loadConfig('foo', doc)).to.eventually.be.rejectedWith(ConfigError);
  });
});
