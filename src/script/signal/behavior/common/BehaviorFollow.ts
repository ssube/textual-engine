import { isNone, mustExist } from '@apextoaster/js-utils';

import { makeCommand } from '../../../../model/Command.js';
import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { VERB_MOVE } from '../../../../util/constants.js';
import { assertActor } from '../../../../util/script/assert.js';
import { SignalBehaviorEnemy } from './BehaviorEnemy.js';

/**
 * The children and soldiers in the Queen's croquet party should:
 *
 * - follow the queen
 */
export async function SignalBehaviorFollow(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const room = mustExist(context.room);
  const pathKey = actor.flags.get('follow');

  if (isNone(pathKey)) {
    return SignalBehaviorEnemy.call(actor, context);
  }

  const path = room.flags.get(pathKey);
  if (isNone(path)) {
    return SignalBehaviorEnemy.call(actor, context);
  }

  // follow the path if possible
  return context.behavior.queue(actor, makeCommand(VERB_MOVE, path));
}
