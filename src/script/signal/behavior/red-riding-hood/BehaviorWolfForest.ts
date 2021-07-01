import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';

/**
 * The first wolf from the forest should:
 *
 * - teleport to grandma's house
 * - eat grandma and teleport her into the wolf's belly
 * - eat red riding hood and teleport her into the wolf's belly
 * - empty the wolf's belly on death
 */
export async function SignalBehaviorRRHWolfForest(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const room = mustExist(context.room);

  // TODO: behavior
}
