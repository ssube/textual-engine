import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { INJECT_EVENT, INJECT_LOCALE } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { PlayerActorService } from '../../../src/service/actor/PlayerActor';
import { CommandEvent, EventBus } from '../../../src/service/event';
import { LocaleService } from '../../../src/service/locale';
import { onceEvent } from '../../../src/util/async/event';
import { getTestContainer } from '../../helper';

describe('player actor', () => {
  it('should parse render output into commands', async () => {
    const container = await getTestContainer(new CoreModule());

    const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();

    const actor = await container.create(PlayerActorService);
    await actor.start();

    const index = 13;
    const line = `foo bar ${index}`;

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<CommandEvent>(event, 'actor-command');

    event.emit('render-output', {
      lines: [line],
    });

    const cmd = await pending;
    return expect(actor.last()).to.eventually.deep.equal(cmd.command);
  });

  xit('should translate and cache verbs');
});
