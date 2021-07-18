import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { makeCommand } from '../../../../model/Command';
import { ACTOR_TYPE, isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';
import { randomItem } from '../../../../util/collection/array';
import { VERB_MOVE } from '../../../../util/constants';
import { SignalBehaviorEnemy } from './BehaviorEnemy';

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
