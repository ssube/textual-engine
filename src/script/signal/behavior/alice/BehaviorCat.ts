import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * The Cheshire Cat should:
 *
 * - enter the world on the Nth turn
 * - remove itself from the world on the Mth turn
 */
export async function SignalBehaviorAliceCat(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertActor(this);

  // TODO: behavior
}
