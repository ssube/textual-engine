import { ScriptTargetError } from '../../../../error/ScriptTargetError.js';
import { isActor } from '../../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';

/**
 * The witch character should:
 *
 * - push the non-player sibling into the cage
 */
export async function SignalBehaviorHGWitch(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  // TODO: behavior
}
