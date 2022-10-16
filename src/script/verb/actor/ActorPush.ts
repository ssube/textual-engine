import { mustExist } from '@apextoaster/js-utils';

import { ACTOR_TYPE, isActor } from '../../../model/entity/Actor.js';
import { isPortal, PORTAL_TYPE } from '../../../model/entity/Portal.js';
import { isRoom, ROOM_TYPE } from '../../../model/entity/Room.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { getPortalStats } from '../../../util/entity/index.js';
import { createFuzzyMatcher } from '../../../util/entity/match.js';
import { assertActor } from '../../../util/script/assert.js';

export async function VerbActorPush(this: ScriptTarget, context: ScriptContext): Promise<void> {
  assertActor(this);

  const command = mustExist(context.command);

  // push target actor/item through portal into dest room
  const [actor] = await context.state.find({
    matchers: createFuzzyMatcher(),
    meta: {
      name: command.targets[0],
    },
    type: ACTOR_TYPE,
  });

  if (!isActor(actor)) {
    return context.state.show(context.source, 'actor.verb.push.target', { command });
  }

  const [portal] = await context.state.find({
    matchers: createFuzzyMatcher(),
    meta: {
      name: command.targets[1],
    },
    type: PORTAL_TYPE,
  });

  if (!isPortal(portal)) {
    return context.state.show(context.source, 'actor.verb.push.portal', { actor, command });
  }

  const { closed, locked } = getPortalStats(portal);
  if (closed) {
    return context.state.show(context.source, 'actor.verb.push.closed', { actor, command, portal });
  }

  if (locked) {
    return context.state.show(context.source, 'actor.verb.push.locked', { actor, command, portal });
  }

  const [target] = await context.state.find({
    meta: {
      id: portal.dest,
    },
    type: ROOM_TYPE,
  });

  if (!isRoom(target)) {
    return context.state.show(context.source, 'actor.verb.push.dest.missing', { actor, command, portal });
  }

  const source = mustExist(context.room);

  await context.state.move({
    moving: actor,
    source,
    target,
  }, context);

  return context.state.show(context.source, 'actor.verb.push.dest.room', { actor, command, portal, room: target });
}
