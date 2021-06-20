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
      targets: ['west window test'],
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
      targets: ['window'],
      verb: 'move',
    }]);
  });

  it('should retain the original order for targets', async () => {
    const container = await getTestContainer(new CoreModule());
    const token = await container.create(NaturalTokenizer);

    const input = 'test the books into the west and with help';
    return expect(token.parse(input)).to.eventually.deep.equal([{
      index: 0,
      input,
      targets: [
        'books',
        'west',
        'help',
      ],
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
