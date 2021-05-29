import { expect } from 'chai';
import { BaseOptions, Container, NullLogger } from 'noicejs';

import { ActorType } from '../../src/model/entity/Actor';
import { INJECT_ACTOR, INJECT_LOCALE } from '../../src/module';
import { ActorLocator, ActorModule } from '../../src/module/ActorModule';
import { LocalModule } from '../../src/module/LocalModule';
import { PlayerActorService } from '../../src/service/actor/PlayerActor';
import { NextLocaleService } from '../../src/service/locale/NextLocale';
import { getTestContainer } from '../helper';

describe('actor module', () => {
  it('should provide a player actor service for player actors', async () => {
    const container = await getTestContainer(new LocalModule(), new ActorModule());

    const locale = await container.create<NextLocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();

    const locator = await container.create<ActorLocator, BaseOptions>(INJECT_ACTOR);
    const actor = await locator.get({
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

    const locator = await container.create<ActorLocator, BaseOptions>(INJECT_ACTOR);

    const actor = await locator.get({
      id: 'foo',
      type: ActorType.DEFAULT,
    });

    const next = await locator.get({
      id: 'foo',
      type: ActorType.DEFAULT,
    });

    expect(actor).to.equal(next);
  });
});
