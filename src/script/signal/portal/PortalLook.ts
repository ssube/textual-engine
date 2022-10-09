import { ScriptTargetError } from '../../../error/ScriptTargetError.js';
import { isPortal } from '../../../model/entity/Portal.js';
import { ROOM_TYPE } from '../../../model/entity/Room.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { getPortalStats } from '../../../util/entity/index.js';

export async function SignalPortalLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isPortal(this)) {
    throw new ScriptTargetError('script target must be a portal');
  }

  await context.state.show(context.source, 'portal.signal.look.seen', { portal: this });

  if (this.dest.length === 0) {
    return context.state.show(context.source, 'portal.signal.look.dest.missing', { portal: this });
  }

  const { closed } = getPortalStats(this);
  if (closed) {
    return context.state.show(context.source, 'portal.signal.look.closed', { portal: this });
  }

  const [room] = await context.state.find({
    meta: {
      id: this.dest,
    },
    type: ROOM_TYPE,
  });

  return context.state.show(context.source, 'portal.signal.look.dest.room', { portal: this, room });
}
