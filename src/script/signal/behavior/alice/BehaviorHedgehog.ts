import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * The hedgehogs in the croquet ground should:
 *
 * - move into a random room when hit with the flamingo
 * - start to wander if they have not been hit in the last turn
 */
export async function SignalBehaviorAliceHedgehog(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertActor(this);

  // TODO: behavior
}
