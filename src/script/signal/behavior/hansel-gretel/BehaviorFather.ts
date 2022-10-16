import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * The father character should:
 *
 * - lead the children into the woods
 * - go back to the house and wait
 */
export async function SignalBehaviorHGFather(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertActor(this);

  // if turn < A, wander normally
  // if turn > A, wait for children outside
  // if children are present, set flag and move into forest
  // wait for children, move again, etc
  // if room is forest clearing, leave children and clear flag
  // head home
}
