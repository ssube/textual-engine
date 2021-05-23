import { expect } from 'chai';
import { Container } from 'noicejs';

import { ActorType } from '../../src/model/entity/Actor';
import { INJECT_INPUT_ACTOR } from '../../src/module';
import { InputModule } from '../../src/module/InputModule';
import { LocalModule } from '../../src/module/LocalModule';
import { ClassicInput } from '../../src/service/input/ClassicInput';

describe('input module', () => {
  it('should provide classic input for player actors', async () => {
    const container = Container.from(new LocalModule(), new InputModule());
    await container.configure();

    const input = await container.create(INJECT_INPUT_ACTOR, {
      id: 'foo',
      type: ActorType.PLAYER,
    });

    expect(input).to.be.instanceOf(ClassicInput);
  });

  it('should provide the same input for the same actor id', async () => {
    const container = Container.from(new LocalModule(), new InputModule());
    await container.configure();

    const input = await container.create(INJECT_INPUT_ACTOR, {
      id: 'foo',
      type: ActorType.DEFAULT,
    });

    const next = await container.create(INJECT_INPUT_ACTOR, {
      id: 'foo',
      type: ActorType.DEFAULT,
    });

    expect(input).to.equal(next);
  });
});
