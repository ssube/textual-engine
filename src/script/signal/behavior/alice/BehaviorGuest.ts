import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';

/**
 * The guests in the Queen's croquet party should:
 *
 * - follow the queen to the croquet ground
 * - play croquet once on the grounds
 * - gather around the Cheshire Cat
 */
export async function SignalBehaviorAliceGuest(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  // TODO: behavior
}
