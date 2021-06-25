import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isRoom } from '../../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function SignalRoomStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isRoom(this)) {
    throw new ScriptTargetError('script target must be a room');
  }
}
