import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * The witch character should:
 *
 * - push the non-player sibling into the cage
 */
export async function SignalBehaviorHGWitch(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertActor(this);

  // TODO: behavior
}
