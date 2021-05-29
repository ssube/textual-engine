import { InvalidArgumentError, isNil, mustExist } from '@apextoaster/js-utils';

import { Actor, ActorType, isActor } from '../../model/entity/Actor';
import { isItem } from '../../model/entity/Item';
import { isRoom } from '../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../service/script';
import {
  SLOT_HIT,
  SLOT_USE,
  STAT_HEALTH,
  VERB_DROP,
  VERB_HIT,
  VERB_LOOK,
  VERB_MOVE,
  VERB_TAKE,
  VERB_USE,
  VERB_WAIT,
} from '../../util/constants';
import { FUZZY_MATCHERS, indexEntity } from '../../util/entity';
import { getKey } from '../../util/map';
import { searchState } from '../../util/state';
import { ShowMessageVolume } from '../../util/state/FocusResolver';

export async function ActorStep(this: ScriptTarget, context: ScriptContext, verbs = ACTOR_VERB_SCRIPTS): Promise<void> {
  context.logger.debug({
    meta: this.meta,
    scope: Object.keys(context),
  }, 'step script');

  if (!isActor(this)) {
    throw new InvalidArgumentError('script target must be an actor');
  }

  const health = getKey(this.stats, STAT_HEALTH, 0);
  if (health <= 0) {
    if (this.actorType === ActorType.PLAYER) {
      await context.focus.show('actor.step.command.dead', { actor: this });
      await context.focus.quit();
    }
    return;
  }

  if (isNil(context.command)) {
    context.logger.debug({ target: this }, 'actor has nothing to do');
    return;
  }

  const { command } = context;
  const verb = verbs.get(command.verb);

  if (isNil(verb)) {
    await context.focus.show('actor.step.command.unknown', { actor: this, command });
    context.logger.warn({ command }, 'unknown verb');
    return;
  }

  if (this.actorType === ActorType.PLAYER) {
    if (command.target.length > 0) {
      await context.focus.show('actor.step.command.player.target', { actor: this, command });
    } else {
      await context.focus.show('actor.step.command.player.verb', { actor: this, command });
    }
  }

  await verb.call(this, context);
}

const ACTOR_VERB_SCRIPTS = new Map([
  [VERB_DROP, ActorStepDrop],
  [VERB_HIT, ActorStepHit],
  [VERB_LOOK, ActorStepLook],
  [VERB_MOVE, ActorStepMove],
  [VERB_TAKE, ActorStepTake],
  [VERB_USE, ActorStepUse],
  [VERB_WAIT, ActorStepWait],
]);

export async function ActorStepDrop(this: Actor, context: ScriptContext): Promise<void> {
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
    await context.focus.show('actor.step.drop.type', { command });
    return;
  }

  await context.transfer.moveItem({
    moving,
    source: this.meta.id,
    target: room.meta.id,
  }, context);
}

export async function ActorStepHit(this: Actor, context: ScriptContext): Promise<void> {
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
    await context.focus.show('actor.step.hit.type', { command }, {
      source: this,
      volume: ShowMessageVolume.SELF,
    });
    return;
  }

  if (this === target) {
    await context.focus.show('actor.step.hit.self', { command }, {
      source: this,
      volume: ShowMessageVolume.SELF,
    });
    return;
  }

  if (this.items.length === 0) {
    await context.focus.show('actor.step.hit.item', { target }, {
      source: this,
      volume: ShowMessageVolume.SELF,
    });
    return;
  }

  await context.script.invoke(target, SLOT_HIT, {
    ...context,
    actor: this,
    item: this.items[0],
  });
}

export async function ActorStepLook(this: Actor, context: ScriptContext): Promise<void> {
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

  await context.focus.show('actor.step.look.none');
}

export async function ActorStepLookRoom(this: Actor, context: ScriptContext): Promise<void> {
  const room = mustExist(context.room);
  await context.focus.show('actor.step.look.room.you', { actor: this });
  await context.focus.show('actor.step.look.room.seen', { room });

  for (const item of this.items) {
    await context.focus.show('actor.step.look.room.inventory', { item });
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
    await context.focus.show('actor.step.look.room.portal', { portal });
  }
}

export async function ActorStepLookActor(this: Actor, context: ScriptContext): Promise<void> {
  const actor = mustExist(context.actor);
  await context.focus.show('actor.step.look.actor.seen', { actor });
  const health = getKey(actor.stats, STAT_HEALTH, 0);
  if (health <= 0) {
    await context.focus.show('actor.step.look.actor.dead', { actor });
  }
}

export async function ActorStepLookItem(this: Actor, context: ScriptContext): Promise<void> {
  const item = mustExist(context.item);
  await context.focus.show('actor.step.look.item.seen', { item });
}

export async function ActorStepMove(this: Actor, context: ScriptContext): Promise<void> {
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
    await context.focus.show('actor.step.move.missing', { command });
    return;
  }

  // move the actor and focus
  await context.focus.show('actor.step.move.portal', {
    actor: this,
    portal: targetPortal,
  }, {
    source: this,
    volume: ShowMessageVolume.SELF,
  });
  await context.transfer.moveActor({
    moving: this,
    source: currentRoom.meta.id,
    target: targetPortal.dest
  }, context);

  if (this.actorType === ActorType.PLAYER) {
    await context.focus.setRoom(targetPortal.dest);
    await ActorStepLookTarget.call(this, context, targetPortal.dest);
  }
}

export async function ActorStepTake(this: Actor, context: ScriptContext): Promise<void> {
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
    await context.focus.show('actor.step.take.type', { command });
    return;
  }

  await context.transfer.moveItem({
    moving,
    source: room.meta.id,
    target: this.meta.id
  }, context);
}

export async function ActorStepUse(this: Actor, context: ScriptContext): Promise<void> {
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
    await context.focus.show('actor.step.use.type', { command });
    return;
  }

  await context.script.invoke(target, SLOT_USE, {
    ...context,
    actor: this,
  });
}

export async function ActorStepWait(this: Actor, context: ScriptContext): Promise<void> {
  context.logger.debug({ target: this }, 'actor is skipping a turn');
}
