import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { DataLoadError } from '../../../src/error/DataLoadError';
import { CoreModule } from '../../../src/module/CoreModule';
import { mapType } from '../../../src/service/parser/yaml/MapType';
import { YamlParser } from '../../../src/service/parser/YamlParser';

describe('yaml parser', () => {
  it('should load and validate data files from string', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const parser = await container.create(YamlParser);
    const data = parser.load(`
states: []
worlds: []
    `);

    expect(data).to.deep.equal({
      states: [],
      worlds: [],
    });
  });

  it('should save data files to string', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const parser = await container.create(YamlParser);
    const data = parser.save({
      worlds: [],
    });

    expect(data).to.deep.equal('worlds: []\n');
  });

  it('should error when loading invalid data files', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const parser = await container.create(YamlParser);
    expect(() => parser.load('nope: {}')).to.throw(DataLoadError);
  });
});

describe('yaml schema', () => {
  it('should parse maps', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    expect(mapType.construct({})).to.deep.equal(new Map());
  });

  it('should write maps', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    if (typeof mapType.represent !== 'function') {
      throw new Error('map cannot be called'); // this should never happen, acts as a typeguard
    }

    expect(mapType.represent(new Map())).to.deep.equal({});
  });
});
