import { mustExist } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions, Container, NullLogger } from 'noicejs';

import { Actor, ActorType } from '../../../src/model/entity/Actor';
import { Room } from '../../../src/model/entity/Room';
import { INJECT_EVENT } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { BehaviorActorService } from '../../../src/service/actor/BehaviorActor';
import { ActorCommandEvent } from '../../../src/service/actor/events';
import { EventBus } from '../../../src/service/event';
import { onceEvent } from '../../../src/util/async/event';
import { VERB_WAIT } from '../../../src/util/constants';

describe('behavior actor', () => {
  it('should respond to room events for non-player actors with a command for the same actor', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const actorService = await container.create(BehaviorActorService, {
      actor: 'foo',
    });
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorCommandEvent>(events, 'actor-command');

    const actor: Actor = {
      actorType: ActorType.DEFAULT,
      items: [],
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      scripts: new Map(),
      stats: new Map(),
      type: 'actor',
    };
    const room: Room = {
      actors: [],
      items: [],
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      portals: [],
      scripts: new Map(),
      type: 'room',
    };
    events.emit('state-room', {
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
