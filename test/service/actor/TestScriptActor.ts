import { mustExist } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { INJECT_EVENT } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { ActorCommandEvent } from '../../../src/service/actor/events';
import { ScriptActorService } from '../../../src/service/actor/ScriptActor';
import { EventBus } from '../../../src/service/event';
import { onceEvent } from '../../../src/util/async/event';
import { EVENT_ACTOR_COMMAND, EVENT_STATE_ROOM, VERB_WAIT } from '../../../src/util/constants';
import { makeTestActor, makeTestRoom } from '../../entity';
import { getTestContainer } from '../../helper';

describe('script actor', () => {
  it('should invoke the behavior signal on room events', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(ScriptActorService, {
      config: {
        attack: 0.5,
        wander: 0.5,
      },
    });
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorCommandEvent>(events, EVENT_ACTOR_COMMAND);

    const actor = makeTestActor('', '', '');
    actor.scripts.set('signal.behavior', {
      data: new Map(),
      name: 'signal-behavior-enemy',
    });

    const room = makeTestRoom('', '', '');
    events.emit(EVENT_STATE_ROOM, {
      actor,
      room,
    });

    const commandEvent = await pending;
    expect(commandEvent.command.verb).to.equal(VERB_WAIT);
    expect(commandEvent).to.have.ownProperty('actor');

    const commandActor = mustExist(commandEvent.actor);
    expect(commandActor.meta.id).to.equal(actor.meta.id);
  });
});
