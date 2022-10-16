import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * The first wolf from the forest should:
 *
 * - teleport to grandma's house
 * - eat grandma and teleport her into the wolf's belly
 * - eat red riding hood and teleport her into the wolf's belly
 * - empty the wolf's belly on death
 */
export async function SignalBehaviorRRHWolfForest(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertActor(this);

  // TODO: behavior
}
