import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../error/ScriptTargetError';
import { Actor, isActor } from '../../model/entity/Actor';
import { isItem } from '../../model/entity/Item';
import { isRoom } from '../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../service/script';
import { getKey } from '../../util/collection/map';
import { STAT_HEALTH } from '../../util/constants';
import { FUZZY_MATCHERS } from '../../util/entity';

export async function VerbActorLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  if (command.target === '') {
    return ActorLookRoom.call(this, context);
  } else {
    return ActorLookTarget.call(this, context, command.target);
  }
}

export async function ActorLookTarget(this: Actor, context: ScriptContext, targetName: string): Promise<void> {
  const results = await context.stateHelper.find({
    meta: {
      name: targetName,
    },
    matchers: FUZZY_MATCHERS
  });

  const target = results[mustExist(context.command).index];

  if (isRoom(target)) {
    return ActorLookRoom.call(this, {
      ...context,
      room: target,
    });
  }

  if (isActor(target)) {
    return ActorLookActor.call(this, {
      ...context,
      actor: target,
    });
  }

  if (isItem(target)) {
    return ActorLookItem.call(this, {
      ...context,
      item: target,
    });
  }

  await context.stateHelper.show('actor.step.look.none');
}

export async function ActorLookRoom(this: Actor, context: ScriptContext): Promise<void> {
  const room = mustExist(context.room);
  await context.stateHelper.show('actor.step.look.room.you', { actor: this });
  await context.stateHelper.show('actor.step.look.room.seen', { room });

  for (const item of this.items) {
    await context.stateHelper.show('actor.step.look.room.inventory', { item });
  }

  for (const actor of room.actors) {
    if (actor !== this) {
      await ActorLookActor.call(this, {
        ...context,
        actor,
      });
    }
  }

  for (const item of room.items) {
    await ActorLookItem.call(this, {
      ...context,
      item,
    });
  }

  for (const portal of room.portals) {
    await context.stateHelper.show('actor.step.look.room.portal', { portal });
  }
}

export async function ActorLookActor(this: Actor, context: ScriptContext): Promise<void> {
  const actor = mustExist(context.actor);
  await context.stateHelper.show('actor.step.look.actor.seen', { actor });
  const health = getKey(actor.stats, STAT_HEALTH, 0);
  if (health <= 0) {
    await context.stateHelper.show('actor.step.look.actor.dead', { actor });
  }
}

export async function ActorLookItem(this: Actor, context: ScriptContext): Promise<void> {
  const item = mustExist(context.item);
  await context.stateHelper.show('actor.step.look.item.seen', { item });
}
