import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * The second wolf from the roof should:
 *
 * - fall into the water trough after sausage water has been added
 */
export async function SignalBehaviorRRHWolfRoof(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertActor(this);

  // TODO: behavior
}
