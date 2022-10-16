import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * The guests in the Queen's croquet party should:
 *
 * - follow the queen to the croquet ground
 * - play croquet once on the grounds
 * - gather around the Cheshire Cat
 */
export async function SignalBehaviorAliceGuest(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertActor(this);

  // TODO: behavior
}
