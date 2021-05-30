import { expect } from 'chai';
import { BaseOptions, ConsoleLogger, Container, LogLevel } from 'noicejs';

import { ActorType } from '../../../src/model/entity/Actor';
import { INJECT_ACTOR, INJECT_EVENT, INJECT_LOCALE } from '../../../src/module';
import { ActorLocator, ActorModule } from '../../../src/module/ActorModule';
import { CoreModule } from '../../../src/module/CoreModule';
import { CommandEvent, EventBus } from '../../../src/service/event';
import { LocaleService } from '../../../src/service/locale';
import { onceWithRemove } from '../../../src/util/event';

describe('player actor', () => {
  it('should parse render output into commands', async () => {
    const module = new CoreModule();
    module.setConfig({
      locale: {
        bundles: {},
        current: 'en',
      },
      logger: {
        level: LogLevel.ERROR,
        name: 'test',
        streams: [],
      },
    });

    const container = Container.from(module, new ActorModule());
    await container.configure({
      logger: ConsoleLogger.global,
    });

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

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const { pending } = onceWithRemove<CommandEvent>(event, 'actor-command');

    event.emit('render-output', {
      lines: [line],
    });

    const cmd = await pending;
    return expect(actor.last()).to.eventually.deep.equal(cmd.command);
  });

  xit('should translate and cache verbs');
});
