import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * The hunter character should:
 *
 * - head to grandma's house
 * - eat any cake along the way
 */
export async function SignalBehaviorRRHHunter(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertActor(this);

  // TODO: behavior
}
