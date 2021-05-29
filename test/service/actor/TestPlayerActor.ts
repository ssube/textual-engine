import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { ActorType } from '../../../src/model/entity/Actor';
import { INJECT_ACTOR, INJECT_EVENT, INJECT_LOCALE } from '../../../src/module';
import { ActorLocator, ActorModule } from '../../../src/module/ActorModule';
import { LocalModule } from '../../../src/module/LocalModule';
import { CommandEvent, EventBus } from '../../../src/service/event';
import { LocaleService } from '../../../src/service/locale';
import { onceWithRemove } from '../../../src/util/event';
import { getTestContainer } from '../../helper';

describe('player actor', () => {
  it('should parse render output into commands', async () => {
    const container = await getTestContainer(new LocalModule(), new ActorModule());

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
