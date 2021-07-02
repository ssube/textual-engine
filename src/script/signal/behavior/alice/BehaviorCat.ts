import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';

/**
 * The Cheshire Cat should:
 *
 * - enter the world on the Nth turn
 * - remove itself from the world on the Mth turn
 */
export async function SignalBehaviorAliceCat(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  // TODO: behavior
}
