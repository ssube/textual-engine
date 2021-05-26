import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { YamlParser } from '../../../src/service/parser/YamlParser';

describe('yaml parser', () => {
  it('should load and validate data files from string', async () => {
    const container = Container.from(new LocalModule());
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
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const parser = await container.create(YamlParser);
    const data = parser.save({
      states: [],
      worlds: [],
    });

    expect(data).to.deep.equal(`states: []
worlds: []
`);
  });
});
