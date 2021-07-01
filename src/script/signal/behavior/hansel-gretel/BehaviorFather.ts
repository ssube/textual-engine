import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';
import { SignalBehaviorEnemy } from '../common/BehaviorEnemy';

/**
 * The father character should:
 *
 * - lead the children into the woods
 * - go back to the house and wait
 */
export async function SignalBehaviorHGFather(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const room = mustExist(context.room);
  const turn = context.step.turn;

  // if turn < A, wander normally
  return SignalBehaviorEnemy.call(this, context);

  // if turn > A, wait for children outside
  // if children are present, set flag and move into forest
  // wait for children, move again, etc
  // if room is forest clearing, leave children and clear flag
  // head home
}
