import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { Actor, isActor } from '../../../model/entity/Actor';
import { isItem } from '../../../model/entity/Item';
import { isPortal } from '../../../model/entity/Portal';
import { isRoom } from '../../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { createFuzzyMatcher } from '../../../util/entity/match';
import { SignalActorLook } from '../../signal/actor/ActorLook';
import { SignalItemLook } from '../../signal/item/ItemLook';
import { SignalPortalLook } from '../../signal/portal/PortalLook';
import { SignalRoomLook } from '../../signal/room/RoomLook';

export async function VerbActorLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  if (command.target === '') {
    return SignalRoomLook.call(this, context);
  } else {
    return ActorLookTarget.call(this, context, command.target);
  }
}

export async function ActorLookTarget(this: Actor, context: ScriptContext, targetName: string): Promise<void> {
  const command = mustExist(context.command);
  const results = await context.state.find({
    meta: {
      name: targetName,
    },
    matchers: createFuzzyMatcher(),
  });

  const target = results[command.index];

  if (isRoom(target)) {
    return SignalRoomLook.call(this, {
      ...context,
      room: target,
    });
  }

  if (isActor(target)) {
    return SignalActorLook.call(this, {
      ...context,
      actor: target,
    });
  }

  if (isItem(target)) {
    return SignalItemLook.call(this, {
      ...context,
      item: target,
    });
  }

  if (isPortal(target)) {
    return SignalPortalLook.call(this, {
      ...context,
      portal: target,
    });
  }

  await context.state.show('actor.step.look.none');
}
