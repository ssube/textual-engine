import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { INJECT_EVENT, INJECT_LOCALE } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { ActorCommandEvent } from '../../../src/service/actor/events';
import { PlayerActorService } from '../../../src/service/actor/PlayerActor';
import { EventBus } from '../../../src/service/event';
import { LocaleService } from '../../../src/service/locale';
import { onceEvent } from '../../../src/util/async/event';
import { EVENT_ACTOR_COMMAND, EVENT_RENDER_OUTPUT } from '../../../src/util/constants';
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
    const pending = onceEvent<ActorCommandEvent>(event, EVENT_ACTOR_COMMAND);

    event.emit(EVENT_RENDER_OUTPUT, {
      lines: [line],
    });

    const cmd = await pending;
    return expect(actor.last()).to.eventually.deep.equal(cmd.command);
  });

  xit('should translate and cache verbs');
});
