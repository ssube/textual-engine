import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { INJECT_EVENT, INJECT_LOCALE } from '../../../src/module/index.js';
import { CoreModule } from '../../../src/module/CoreModule.js';
import { EventBus } from '../../../src/service/event/index.js';
import { LocaleService } from '../../../src/service/locale/index.js';
import { SplitTokenizer } from '../../../src/service/tokenizer/SplitTokenizer.js';
import { EVENT_LOCALE_BUNDLE } from '../../../src/util/constants.js';
import { getTestContainer } from '../../helper.js';

describe('split tokenizer', () => {
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

  it('should translate and cache verbs', async () => {
    const container = await getTestContainer(new CoreModule());

    const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();

    const token = await container.create(SplitTokenizer);
    await token.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    event.emit(EVENT_LOCALE_BUNDLE, {
      name: 'world',
      bundle: {
        languages: {
          en: {
            articles: ['art'],
            prepositions: ['pre'],
            strings: {
              verbs: {
                foo: 'fin',
              },
            },
            verbs: ['verbs.foo'],
          },
        },
      }
    });

    // use translated verbs
    const input = 'fin art bar pre bin';
    const commands = await token.parse(input);

    expect(commands).to.have.lengthOf(1);
    expect(commands[0]).to.deep.equal({
      index: 0,
      input,
      targets: ['bar', 'bin'],
      verb: 'verbs.foo',
    });
  });
});
