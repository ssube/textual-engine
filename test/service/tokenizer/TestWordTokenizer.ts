import { expect } from 'chai';
import { Container } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { WordTokenizer } from '../../../src/service/tokenizer/WordTokenizer';

describe('work tokenizer', () => {
  it('should parse token lines', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const token = await container.create(WordTokenizer);

    return expect(token.parse('foo')).to.eventually.deep.equal({
      index: 0,
      token: 'foo',
      target: '',
      verb: 'foo',
    });
  });

  it('should parse a final numeric segment as the command index', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const token = await container.create(WordTokenizer);

    const index = 13;
    const line = `foo bar ${index}`;
    return expect(token.parse(line)).to.eventually.deep.equal({
      index,
      token: line,
      target: 'bar',
      verb: 'foo',
    });
  });

});
