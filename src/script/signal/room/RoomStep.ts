import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { assertRoom } from '../../../util/script/assert.js';

export async function SignalRoomStep(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertRoom(this);
}
