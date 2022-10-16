import { ACTOR_TYPE } from '../../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { assertPortal } from '../../../../util/script/assert.js';
import { SignalPortalLook } from '../PortalLook.js';

/**
 * Describe the room on the other side, and whether it contains one of the siblings.
 */
export async function SignalPortalLookHGOven(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const portal = assertPortal(this);

  await SignalPortalLook.call(portal, context);

  const actors = await context.state.find({
    room: {
      id: portal.meta.id,
    },
    type: ACTOR_TYPE,
  });

  for (const actor of actors) {
    await context.state.show(context.source, 'portal.look.actor', { actor });
  }
}
