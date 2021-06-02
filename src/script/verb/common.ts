import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../error/ScriptTargetError';
import { Actor, ActorType, isActor } from '../../model/entity/Actor';
import { isItem } from '../../model/entity/Item';
import { isRoom } from '../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../service/script';
import { ShowVolume } from '../../util/actor';
import { getKey } from '../../util/collection/map';
import { SLOT_HIT, SLOT_USE, STAT_HEALTH } from '../../util/constants';
import { FUZZY_MATCHERS, indexEntity } from '../../util/entity';
import { searchState } from '../../util/state';

export async function ActorStepDrop(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);

  const results = searchState(context.state, {
    actor: {
      id: this.meta.id,
    },
    meta: {
      name: command.target,
    },
    room: {
      id: room.meta.id,
    },
  }, FUZZY_MATCHERS);

  const moving = indexEntity(results, command.index, isItem);
  if (isNil(moving)) {
    await context.stateHelper.show('actor.step.drop.type', { command });
    return;
  }

  await context.transfer.moveItem({
    moving,
    source: this.meta.id,
    target: room.meta.id,
  }, context);
}

export async function ActorStepHit(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);

  const results = searchState(context.state, {
    meta: {
      name: command.target,
    },
    room: {
      id: room.meta.id,
    },
  }, FUZZY_MATCHERS);
  const target = indexEntity(results, command.index, isActor);

  if (isNil(target)) {
    await context.stateHelper.show('actor.step.hit.type', { command }, ShowVolume.SELF, {
      actor: this,
      room,
    });
    return;
  }

  if (this === target) {
    await context.stateHelper.show('actor.step.hit.self', { command }, ShowVolume.SELF, {
      actor: this,
      room,
    });
    return;
  }

  if (this.items.length === 0) {
    await context.stateHelper.show('actor.step.hit.item', { target }, ShowVolume.SELF, {
      actor: this,
      room,
    });
    return;
  }

  await context.script.invoke(target, SLOT_HIT, {
    ...context,
    actor: this,
    item: this.items[0],
  });
}

export async function ActorStepLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  if (command.target === '') {
    return ActorStepLookRoom.call(this, context);
  } else {
    return ActorStepLookTarget.call(this, context, command.target);
  }
}

export async function ActorStepLookTarget(this: Actor, context: ScriptContext, targetName: string): Promise<void> {
  const results = searchState(context.state, {
    meta: {
      name: targetName,
    }
  }, FUZZY_MATCHERS);

  const target = results[mustExist(context.command).index];

  if (isRoom(target)) {
    return ActorStepLookRoom.call(this, {
      ...context,
      room: target,
    });
  }

  if (isActor(target)) {
    return ActorStepLookActor.call(this, {
      ...context,
      actor: target,
    });
  }

  if (isItem(target)) {
    return ActorStepLookItem.call(this, {
      ...context,
      item: target,
    });
  }

  await context.stateHelper.show('actor.step.look.none');
}

export async function ActorStepLookRoom(this: Actor, context: ScriptContext): Promise<void> {
  const room = mustExist(context.room);
  await context.stateHelper.show('actor.step.look.room.you', { actor: this });
  await context.stateHelper.show('actor.step.look.room.seen', { room });

  for (const item of this.items) {
    await context.stateHelper.show('actor.step.look.room.inventory', { item });
  }

  for (const actor of room.actors) {
    if (actor !== this) {
      await ActorStepLookActor.call(this, {
        ...context,
        actor,
      });
    }
  }

  for (const item of room.items) {
    await ActorStepLookItem.call(this, {
      ...context,
      item,
    });
  }

  for (const portal of room.portals) {
    await context.stateHelper.show('actor.step.look.room.portal', { portal });
  }
}

export async function ActorStepLookActor(this: Actor, context: ScriptContext): Promise<void> {
  const actor = mustExist(context.actor);
  await context.stateHelper.show('actor.step.look.actor.seen', { actor });
  const health = getKey(actor.stats, STAT_HEALTH, 0);
  if (health <= 0) {
    await context.stateHelper.show('actor.step.look.actor.dead', { actor });
  }
}

export async function ActorStepLookItem(this: Actor, context: ScriptContext): Promise<void> {
  const item = mustExist(context.item);
  await context.stateHelper.show('actor.step.look.item.seen', { item });
}

export async function ActorStepMove(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  // find the new room
  const command = mustExist(context.command);
  const targetName = command.target;

  const currentRoom = mustExist(context.room);
  const results = currentRoom.portals.filter((it) => {
    const group = it.sourceGroup.toLocaleLowerCase();
    const name = it.name.toLocaleLowerCase();
    // portals in the same group usually lead to the same place, but name and group can both be ambiguous
    return (name === targetName || group === targetName || `${group} ${name}` === targetName);
  });
  const targetPortal = results[command.index];

  if (isNil(targetPortal)) {
    await context.stateHelper.show('actor.step.move.missing', { command });
    return;
  }

  // move the actor and focus
  await context.stateHelper.show('actor.step.move.portal', {
    actor: this,
    portal: targetPortal,
  }, ShowVolume.SELF, {
    actor: this,
    room: currentRoom,
  });
  await context.transfer.moveActor({
    moving: this,
    source: currentRoom.meta.id,
    target: targetPortal.dest
  }, context);

  if (this.actorType === ActorType.PLAYER) {
    await ActorStepLookTarget.call(this, context, targetPortal.dest);
  }
}

export async function ActorStepTake(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);
  context.logger.debug({ command, room }, 'taking item from room');

  const valid = new Set(room.items.map((it) => it.meta.id));
  const results = searchState(context.state, {
    meta: {
      name: command.target,
    },
    room: {
      id: room.meta.id,
    },
  }, {
    ...FUZZY_MATCHERS,
    entity: (entity, search) => {
      // exclude own and other's inventory items
      if (valid.has(entity.meta.id)) {
        return FUZZY_MATCHERS.entity(entity, search);
      } else {
        return false;
      }
    },
  });

  const moving = indexEntity(results, command.index, isItem);

  if (isNil(moving)) {
    await context.stateHelper.show('actor.step.take.type', { command });
    return;
  }

  await context.transfer.moveItem({
    moving,
    source: room.meta.id,
    target: this.meta.id
  }, context);
}

export async function ActorStepUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);
  const results = searchState(context.state, {
    meta: {
      name: command.target,
    },
    room: {
      id: room.meta.id,
    },
  }, FUZZY_MATCHERS);
  const target = indexEntity(results, command.index, isItem);

  if (!isItem(target)) {
    await context.stateHelper.show('actor.step.use.type', { command });
    return;
  }

  await context.script.invoke(target, SLOT_USE, {
    ...context,
    actor: this,
  });
}

export async function ActorStepWait(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  context.logger.debug({ target: this }, 'actor is skipping a turn');
}
 