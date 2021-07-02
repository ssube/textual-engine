import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';

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
