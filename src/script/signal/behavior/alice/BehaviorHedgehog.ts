import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';

/**
 * The hedgehogs in the croquet ground should:
 *
 * - move into a random room when hit with the flamingo
 * - start to wander if they have not been hit in the last turn
 */
export async function SignalBehaviorAliceHedgehog(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  // TODO: behavior
}
