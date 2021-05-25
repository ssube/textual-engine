import { expect } from 'chai';
import { Container } from 'noicejs';

import { ActorType } from '../../src/model/entity/Actor';
import { INJECT_ACTOR_PLAYER } from '../../src/module';
import { InputModule } from '../../src/module/InputModule';
import { LocalModule } from '../../src/module/LocalModule';
import { WordTokenizer } from '../../src/service/tokenizer/WordTokenizer';

describe('input module', () => {
  it('should provide classic input for player actors', async () => {
    const container = Container.from(new LocalModule(), new InputModule());
    await container.configure();

    const actor = await container.create(INJECT_ACTOR_PLAYER, {
      id: 'foo',
      type: ActorType.PLAYER,
    });

    expect(actor).to.be.instanceOf(WordTokenizer);
  });

  it('should provide the same input for the same actor id', async () => {
    const container = Container.from(new LocalModule(), new InputModule());
    await container.configure();

    const actor = await container.create(INJECT_ACTOR_PLAYER, {
      id: 'foo',
      type: ActorType.DEFAULT,
    });

    const next = await container.create(INJECT_ACTOR_PLAYER, {
      id: 'foo',
      type: ActorType.DEFAULT,
    });

    expect(actor).to.equal(next);
  });
});
