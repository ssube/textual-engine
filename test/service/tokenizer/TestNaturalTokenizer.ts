import { expect } from 'chai';

import { CoreModule } from '../../../src/module/CoreModule';
import { NaturalTokenizer } from '../../../src/service/tokenizer/NaturalTokenizer';
import { getTestContainer } from '../../helper';

describe('natural tokenizer', () => {
  it('should use first verb', async () => {
    const container = await getTestContainer(new CoreModule());
    const token = await container.create(NaturalTokenizer);

    const input = 'move west window test';
    return expect(token.parse(input)).to.eventually.deep.equal([{
      index: 0,
      input,
      target: 'west window test',
      verb: 'move',
    }]);
  });

  it('should use first cardinal value for index', async () => {
    const container = await getTestContainer(new CoreModule());
    const token = await container.create(NaturalTokenizer);

    const input = 'move window 2';
    return expect(token.parse(input)).to.eventually.deep.equal([{
      index: 2,
      input,
      target: 'window',
      verb: 'move',
    }]);
  });

  xit('should merge nouns and other verbs in order', async () => {
    const container = await getTestContainer(new CoreModule());
    const token = await container.create(NaturalTokenizer);

    const input = 'test books go west help';
    return expect(token.parse(input)).to.eventually.deep.equal([{
      index: 0,
      input,
      target: 'books go west help',
      verb: 'test',
    }]);
  });

  xit('should split up verb sequences', async () => {
    const container = await getTestContainer(new CoreModule());
    const token = await container.create(NaturalTokenizer);

    const input = 'test go help';
    return expect(token.parse(input)).to.eventually.deep.equal([{
      index: 0,
      input,
      target: '',
      verb: 'test',
    }]);
  });
});
