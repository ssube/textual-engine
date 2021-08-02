import { ScriptTargetError } from '../../../../error/ScriptTargetError.js';
import { isActor } from '../../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';

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

  // if turn < A, wander normally
  // if turn > A, wait for children outside
  // if children are present, set flag and move into forest
  // wait for children, move again, etc
  // if room is forest clearing, leave children and clear flag
  // head home
}
