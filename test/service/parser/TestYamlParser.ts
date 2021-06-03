import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { DataLoadError } from '../../../src/error/DataError';
import { CoreModule } from '../../../src/module/CoreModule';
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
