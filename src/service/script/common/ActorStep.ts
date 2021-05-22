import { doesExist, InvalidArgumentError, isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '..';
import { Actor, ActorType, isActor } from '../../../model/entity/Actor';
import { isItem } from '../../../model/entity/Item';
import { isRoom } from '../../../model/entity/Room';
import {
  SLOT_HIT,
  SLOT_USE,
  VERB_DROP,
  VERB_HIT,
  VERB_LOOK,
  VERB_MOVE,
  VERB_TAKE,
  VERB_USE,
  VERB_WAIT,
} from '../../../util/constants';
import { FUZZY_MATCHERS, indexEntity } from '../../../util/entity';
import { getKey } from '../../../util/map';
import { searchState } from '../../../util/state/search';

export async function ActorStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  context.logger.debug({
    meta: this.meta,
    scope: Object.keys(context),
  }, 'step script');

  if (!isActor(this)) {
    throw new InvalidArgumentError('script target must be an actor');
  }

  const health = getKey(this.stats, 'health', 0);
  if (health <= 0) {
    if (this.actorType === ActorType.PLAYER) {
      await context.focus.show(`${this.meta.name} is dead`);
    }
    return;
  }

  if (doesExist(context.command)) {
    await ActorStepCommand.call(this, context);
  } else {
    context.logger.debug({ target: this }, 'actor has nothing to do');
  }
}

const knownVerbs = new Map([
  [VERB_DROP, ActorStepDrop],
  [VERB_HIT, ActorStepHit],
  [VERB_LOOK, ActorStepLook],
  [VERB_MOVE, ActorStepMove],
  [VERB_TAKE, ActorStepTake],
  [VERB_USE, ActorStepUse],
  [VERB_WAIT, ActorStepWait],
]);

export async function ActorStepCommand(this: Actor, context: ScriptContext): Promise<void> {
  const cmd = mustExist(context.command);
  const verb = knownVerbs.get(cmd.verb);

  if (doesExist(verb)) {
    if (this.actorType === ActorType.PLAYER) {
      await context.focus.show(`${this.meta.name} will ${cmd.verb} the ${cmd.target}`);
    }

    await verb.call(this, context);
  } else {
    await context.focus.show(`${this.meta.name} does not know how to ${cmd.verb}!`);
    context.logger.warn('unknown verb');
  }
}

export async function ActorStepDrop(this: Actor, context: ScriptContext): Promise<void> {
  const cmd = mustExist(context.command);
  const room = mustExist(context.room);

  const results = searchState(context.state, {
    meta: {
      name: cmd.target,
    },
    room: {
      id: room.meta.id,
    },
  }, FUZZY_MATCHERS);

  const moving = indexEntity(results, cmd.index, isItem);
  if (isNil(moving)) {
    await context.focus.show(`${cmd.target} is not an item`);
    return;
  }

  await context.transfer.moveItem({
    moving,
    source: this.meta.id,
    target: room.meta.id,
  }, context);
}

export async function ActorStepHit(this: Actor, context: ScriptContext): Promise<void> {
  const cmd = mustExist(context.command);
  const room = mustExist(context.room);

  const results = searchState(context.state, {
    meta: {
      name: cmd.target,
    },
    room: {
      id: room.meta.id,
    },
  }, FUZZY_MATCHERS);
  const target = indexEntity(results, cmd.index, isActor);

  if (isNil(target)) {
    await context.focus.show(`${cmd.target} is not an actor`);
    return;
  }

  if (this.items.length === 0) {
    await context.focus.show(`You cannot hit ${target.meta.name}, you are not holding anything!`);
    return;
  }

  await context.script.invoke(target, SLOT_HIT, {
    ...context,
    actor: this,
    item: this.items[0],
  });
}

export async function ActorStepLook(this: Actor, context: ScriptContext): Promise<void> {
  const cmd = mustExist(context.command);
  if (cmd.target === '') {
    return ActorStepLookRoom.call(this, context);
  } else {
    return ActorStepLookTarget.call(this, context);
  }
}

export async function ActorStepLookTarget(this: Actor, context: ScriptContext): Promise<void> {
  const targetName = mustExist(context.command).target;
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

  await context.focus.show('You see nothing.');
}

export async function ActorStepLookRoom(this: Actor, context: ScriptContext): Promise<void> {
  const room = mustExist(context.room);
  await context.focus.show(`You are a ${this.meta.name}: ${this.meta.desc} (${this.meta.id})`);
  await context.focus.show(`You are in ${room.meta.name} (${room.meta.id}): ${room.meta.desc}`);

  for (const item of this.items) {
    await context.focus.show(`You are holding a ${item.meta.name}: ${item.meta.desc} (${item.meta.id})`);
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
    await context.focus.show(`A ${portal.name} leads to the ${portal.sourceGroup} (${portal.dest})`);
  }
}

export async function ActorStepLookActor(this: Actor, context: ScriptContext): Promise<void> {
  const actor = mustExist(context.actor);
  await context.focus.show(`A ${actor.meta.name} (${actor.meta.desc}, ${actor.meta.id}) is in the room`);
  const health = getKey(actor.stats, 'health', 0);
  if (health <= 0) {
    await context.focus.show(`${actor.meta.name} is dead`);
  }
}

export async function ActorStepLookItem(this: Actor, context: ScriptContext): Promise<void> {
  const item = mustExist(context.item);
  await context.focus.show(`You see a ${item.meta.name}: ${item.meta.desc} (${item.meta.id})`);
}

export async function ActorStepMove(this: Actor, context: ScriptContext): Promise<void> {
  // find the new room
  const currentRoom = mustExist(context.room);
  const targetName = mustExist(context.command).target;

  const targetPortal = currentRoom.portals.find((it) => it.name === targetName);
  if (isNil(targetPortal)) {
    context.logger.warn({
      portals: currentRoom.portals,
    }, `portal ${targetName} not found`);
    return;
  }

  // move the actor and focus
  await context.focus.show(`${this.meta.name} moved to ${targetPortal.name}`);
  await context.transfer.moveActor({
    moving: this,
    source: currentRoom.meta.id,
    target: targetPortal.dest
  }, context);

  if (this.actorType === ActorType.PLAYER) {
    await context.focus.setRoom(targetPortal.dest);
  }
}

export async function ActorStepTake(this: Actor, context: ScriptContext): Promise<void> {
  const cmd = mustExist(context.command);
  const room = mustExist(context.room);
  context.logger.debug({ cmd, room }, 'taking item from room');

  const results = searchState(context.state, {
    meta: {
      name: cmd.target,
    },
    room: {
      id: room.meta.id,
    },
  }, FUZZY_MATCHERS);

  const moving = indexEntity(results, cmd.index, isItem);

  if (isNil(moving)) {
    await context.focus.show(`${cmd.target} is not an item`);
    return;
  }

  await context.transfer.moveItem({
    moving,
    source: room.meta.id,
    target: this.meta.id
  }, context);
}

export async function ActorStepUse(this: Actor, context: ScriptContext): Promise<void> {
  const cmd = mustExist(context.command);
  const room = mustExist(context.room);
  const results = searchState(context.state, {
    meta: {
      name: cmd.target,
    },
    room: {
      id: room.meta.id,
    },
  }, FUZZY_MATCHERS);
  const target = indexEntity(results, cmd.index, isItem);

  if (isNil(target)) {
    await context.focus.show(`${cmd.target} is not a usable item`);
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
