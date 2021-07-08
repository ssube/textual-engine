import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { makeCommand } from '../../../../model/Command';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';
import { VERB_MOVE } from '../../../../util/constants';
import { SignalBehaviorEnemy } from './BehaviorEnemy';

/**
 * The children and soldiers in the Queen's croquet party should:
 *
 * - follow the queen
 */
export async function SignalBehaviorFollow(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const room = mustExist(context.room);
  const pathKey = this.flags.get('follow');

  if (isNil(pathKey)) {
    return SignalBehaviorEnemy.call(this, context);
  }

  const path = room.flags.get(pathKey);
  if (isNil(path)) {
    return SignalBehaviorEnemy.call(this, context);
  }

  // follow the path if possible
  return context.behavior.queue(this, makeCommand(VERB_MOVE, path));
}
