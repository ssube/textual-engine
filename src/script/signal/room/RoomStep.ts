import { ScriptTargetError } from '../../../error/ScriptTargetError.js';
import { isRoom } from '../../../model/entity/Room.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';

export async function SignalRoomStep(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  if (!isRoom(this)) {
    throw new ScriptTargetError('script target must be a room');
  }
}
