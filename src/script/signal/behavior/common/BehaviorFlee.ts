import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../../error/ScriptTargetError.js';
import { makeCommand } from '../../../../model/Command.js';
import { ACTOR_TYPE, isActor } from '../../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { randomItem } from '../../../../util/collection/array.js';
import { VERB_MOVE } from '../../../../util/constants.js';
import { SignalBehaviorEnemy } from './BehaviorEnemy.js';

export async function SignalBehaviorFlee(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const room = mustExist(context.room);

  // move away from the flagged actors
  const flee = this.flags.get('flee');
  if (doesExist(flee)) {
    const actors = await context.state.find({
      meta: {
        id: flee,
      },
      room: {
        id: room.meta.id,
      },
      type: ACTOR_TYPE,
    });

    if (actors.length > 0) {
      // pick a portal and move
      const portal = randomItem(room.portals, context.random);
      return context.behavior.queue(this, makeCommand(VERB_MOVE, portal.meta.name));
    }
  }

  return SignalBehaviorEnemy.call(this, context);
}
