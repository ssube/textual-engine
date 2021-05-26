import { expect } from 'chai';
import { BaseOptions, Container, NullLogger } from 'noicejs';

import { ActorType } from '../../../src/model/entity/Actor';
import { INJECT_ACTOR, INJECT_EVENT, INJECT_LOCALE } from '../../../src/module';
import { ActorLocator, ActorModule } from '../../../src/module/ActorModule';
import { LocalModule } from '../../../src/module/LocalModule';
import { CommandEvent, EventBus } from '../../../src/service/event';
import { LocaleService } from '../../../src/service/locale';
import { onceWithRemove } from '../../../src/util/event';

describe('player actor', () => {
  it('should ', async () => {
    const container = Container.from(new LocalModule(), new ActorModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);

    const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();

    const locator = await container.create<ActorLocator, BaseOptions>(INJECT_ACTOR);
    const actor = await locator.get({
      id: 'foo',
      type: ActorType.PLAYER,
    });
    await actor.start();

    const index = 13;
    const line = `foo bar ${index}`;

    const { pending } = onceWithRemove<CommandEvent>(event, 'actor-command');

    event.emit('render-output', {
      lines: [line],
    });

    const cmd = await pending;
    return expect(actor.last()).to.eventually.deep.equal(cmd.command);
  });

  xit('should translate and cache verbs');
});
