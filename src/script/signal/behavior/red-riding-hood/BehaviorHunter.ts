import { ScriptTargetError } from '../../../../error/ScriptTargetError.js';
import { isActor } from '../../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';

/**
 * The hunter character should:
 *
 * - head to grandma's house
 * - eat any cake along the way
 */
export async function SignalBehaviorRRHHunter(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  // TODO: behavior
}
