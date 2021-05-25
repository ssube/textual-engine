import { expect } from 'chai';
import { BaseOptions, Container, NullLogger } from 'noicejs';

import { ActorType } from '../../src/model/entity/Actor';
import { INJECT_ACTOR_PLAYER } from '../../src/module';
import { ActorModule } from '../../src/module/ActorModule';
import { LocalModule } from '../../src/module/LocalModule';
import { ActorService } from '../../src/service/actor';
import { PlayerActorService } from '../../src/service/actor/PlayerActor';

describe('actor module', () => {
  it('should provide a player actor service for player actors', async () => {
    const container = Container.from(new LocalModule(), new ActorModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const actor = await container.create<ActorService, BaseOptions>(INJECT_ACTOR_PLAYER, {
      id: 'foo',
      type: ActorType.PLAYER,
    });

    expect(actor).to.be.instanceOf(PlayerActorService);
  });

  it('should provide the same input for the same actor id', async () => {
    const container = Container.from(new LocalModule(), new ActorModule());
    await container.configure({
      logger: NullLogger.global,
    });

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
