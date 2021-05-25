import { expect } from 'chai';
import { Container } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { PlayerActorService } from '../../../src/service/actor/PlayerActor';
import { onceWithRemove } from '../../../src/util/event';

describe('player actor', () => {
  it('should save the last parsed command', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const actor = await container.create(PlayerActorService);

    const index = 13;
    const line = `foo bar ${index}`;

    const { pending } = onceWithRemove(actor, 'command');

    actor.emit('input', {
      lines: [line],
    });

    const cmd = await pending;
    return expect(actor.last()).to.eventually.deep.equal(cmd);
  });

  xit('should translate and cache verbs');
});
