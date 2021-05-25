import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { WordTokenizer } from '../../../src/service/tokenizer/WordTokenizer';

describe('word tokenizer', () => {
  it('should parse token lines', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const token = await container.create(WordTokenizer);

    return expect(token.parse('foo')).to.eventually.deep.equal([{
      index: 0,
      input: 'foo',
      target: '',
      verb: 'foo',
    }]);
  });

  it('should parse a final numeric segment as the command index', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const token = await container.create(WordTokenizer);

    const index = 13;
    const input = `foo bar ${index}`;
    return expect(token.parse(input)).to.eventually.deep.equal([{
      index,
      input,
      target: 'bar',
      verb: 'foo',
    }]);
  });
});
