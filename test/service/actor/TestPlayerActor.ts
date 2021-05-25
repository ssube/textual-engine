import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { ActorModule } from '../../../src/module/ActorModule';
import { LocalModule } from '../../../src/module/LocalModule';
import { CommandEvent } from '../../../src/service/actor';
import { PlayerActorService } from '../../../src/service/actor/PlayerActor';
import { onceWithRemove } from '../../../src/util/event';

describe('player actor', () => {
  it('should ', async () => {
    const container = Container.from(new LocalModule(), new ActorModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const actor = await container.create(PlayerActorService);
    await actor.start();

    const index = 13;
    const line = `foo bar ${index}`;

    const { pending } = onceWithRemove<CommandEvent>(actor, 'command');

    actor.emit('input', {
      lines: [line],
    });

    const event = await pending;
    return expect(actor.last()).to.eventually.deep.equal(event.command);
  });

  xit('should translate and cache verbs');
});
