import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { WorldEntity } from '../../../model/entity';
import { isActor } from '../../../model/entity/Actor';
import { ScriptContext } from '../../../service/script';
import { getKey } from '../../../util/collection/map';
import { STAT_HEALTH } from '../../../util/constants';
import { SignalActorLook } from '../actor/ActorLook';
import { SignalItemLook } from '../item/ItemLook';
import { SignalPortalLook } from '../portal/PortalLook';

export async function SignalRoomLook(this: WorldEntity, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be actor');
  }

  const room = mustExist(context.room);
  const health = getKey(this.stats, STAT_HEALTH, 0);
  await context.state.show('actor.step.look.room.you', { actor: this });
  await context.state.show('actor.step.look.room.health', { actor: this, health });
  await context.state.show('actor.step.look.room.seen', { room });

  for (const item of this.items) {
    await context.state.show('actor.step.look.room.inventory', { item });
  }

  for (const actor of room.actors) {
    if (actor === this) {
      continue;
    }

    await SignalActorLook.call(this, {
      ...context,
      actor,
    });
  }

  for (const item of room.items) {
    await SignalItemLook.call(this, {
      ...context,
      item,
    });
  }

  for (const portal of room.portals) {
    await SignalPortalLook.call(this, {
      ...context,
      portal,
    });
  }
}
