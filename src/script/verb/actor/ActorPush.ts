import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { ACTOR_TYPE, isActor } from '../../../model/entity/Actor';
import { isPortal, PORTAL_TYPE } from '../../../model/entity/Portal';
import { isRoom, ROOM_TYPE } from '../../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { createFuzzyMatcher } from '../../../util/entity/match';

export async function VerbActorPush(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

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
    return;
  }

  const [portal] = await context.state.find({
    matchers: createFuzzyMatcher(),
    meta: {
      name: command.targets[1],
    },
    type: PORTAL_TYPE,
  });

  if (!isPortal(portal)) {
    return;
  }

  const [target] = await context.state.find({
    meta: {
      id: portal.dest,
    },
    type: ROOM_TYPE,
  });

  if (!isRoom(target)) {
    return;
  }

  const source = mustExist(context.room);

  await context.state.move({
    moving: actor,
    source,
    target,
  }, context);
}
