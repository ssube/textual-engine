import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';

/**
 * The character of Van Helsing should:
 *
 * - appear on the Nth turn
 * - move to the back of the house
 * - give the saw to the player
 * - move to Lucy's room
 * - teleport into the living room with Lucy
 * - give the note to the player
 */
export async function SignalBehaviorDraculaVanHelsing(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  // TODO: behavior
}
