import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { ACTOR_TYPE } from '../../../../model/entity/Actor';
import { isPortal } from '../../../../model/entity/Portal';
import { ScriptContext, ScriptTarget } from '../../../../service/script';
import { SignalPortalLook } from '../PortalLook';

/**
 * Describe the room on the other side, and whether it contains one of the siblings.
 */
export async function SignalPortalLookOven(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isPortal(this)) {
    throw new ScriptTargetError('script target must be a portal');
  }

  await SignalPortalLook.call(this, context);

  const siblings = await context.state.find({
    room: {
      id: this.meta.id,
    },
    type: ACTOR_TYPE,
  });

  for (const actor of siblings) {
    await context.state.show(context.source, 'portal.look.actor', { actor });
  }
}
