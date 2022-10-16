import { ROOM_TYPE } from '../../../model/entity/Room.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { getPortalStats } from '../../../util/entity/index.js';
import { assertPortal } from '../../../util/script/assert.js';

export async function SignalPortalLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const portal = assertPortal(this);

  await context.state.show(context.source, 'portal.signal.look.seen', { portal });

  if (portal.dest.length === 0) {
    return context.state.show(context.source, 'portal.signal.look.dest.missing', { portal });
  }

  const { closed } = getPortalStats(portal);
  if (closed) {
    return context.state.show(context.source, 'portal.signal.look.closed', { portal });
  }

  const [room] = await context.state.find({
    meta: {
      id: portal.dest,
    },
    type: ROOM_TYPE,
  });

  return context.state.show(context.source, 'portal.signal.look.dest.room', { portal, room });
}
