import { expect } from 'chai';

import { CoreModule } from '../../../src/module/CoreModule';
import { SplitTokenizer } from '../../../src/service/tokenizer/SplitTokenizer';
import { getTestContainer } from '../../helper';

describe('word tokenizer', () => {
  it('should parse token lines', async () => {
    const container = await getTestContainer(new CoreModule());
    const token = await container.create(SplitTokenizer);

    return expect(token.parse('foo')).to.eventually.deep.equal([{
      index: 0,
      input: 'foo',
      targets: [],
      verb: 'foo',
    }]);
  });

  it('should parse a final numeric segment as the command index', async () => {
    const container = await getTestContainer(new CoreModule());
    const token = await container.create(SplitTokenizer);

    const index = 13;
    const input = `foo bar ${index}`;
    return expect(token.parse(input)).to.eventually.deep.equal([{
      index,
      input,
      targets: ['bar'],
      verb: 'foo',
    }]);
  });

  xit('should translate and cache verbs');
});
