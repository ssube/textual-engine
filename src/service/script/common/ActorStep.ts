import { doesExist, InvalidArgumentError, isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '..';
import { Actor, ActorType, isActor } from '../../../model/entity/Actor';
import { isItem } from '../../../model/entity/Item';
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
import { getKey } from '../../../util/map';
import { searchStateString } from '../../../util/state/search';

export async function ActorStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  context.logger.debug({
    meta: this.meta,
    scope: Object.keys(context),
  }, 'step script');

  if (!isActor(this)) {
    throw new InvalidArgumentError('script target must be an actor');
  }

  if (doesExist(context.command)) {
    await ActorStepCommand.call(this, context);
  } else {
    context.logger.debug(`${this.meta.name} has nothing to do`);
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

  const [moving] = searchStateString(context.state, {
    meta: cmd.target,
    room: {
      id: room.meta.id,
    },
  });

  if (!isItem(moving)) {
    await context.focus.show(`${moving.meta.name} is not an item`);
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

  const [target] = searchStateString(context.state, {
    meta: cmd.target,
    room: {
      id: room.meta.id,
    },
  });

  if (!isActor(target)) {
    await context.focus.show(`${target} is not an actor`);
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
  await context.focus.show('You see nothing.');
}

export async function ActorStepLookRoom(this: Actor, context: ScriptContext): Promise<void> {
  if (doesExist(context.room)) {
    await context.focus.show(`You are a ${this.meta.name}: ${this.meta.desc} (${this.meta.id})`);
    await context.focus.show(`You are in ${context.room.meta.name} (${context.room.meta.id}): ${context.room.meta.desc}`);

    for (const item of this.items) {
      await context.focus.show(`You are holding a ${item.meta.name} (${item.meta.id})`);
    }

    for (const actor of context.room.actors) {
      if (actor !== this) {
        await context.focus.show(`A ${actor.meta.name} (${actor.meta.desc}, ${actor.meta.id}) is in the room`);
        const health = getKey(actor.stats, 'health', 0);
        if (health <= 0) {
          await context.focus.show(`${actor.meta.name} is dead`);
        }
      }
    }

    for (const item of context.room.items) {
      await context.focus.show(`A ${item.meta.name} is lying on the floor (${item.meta.id})`);
    }

    for (const portal of context.room.portals) {
      await context.focus.show(`A ${portal.name} leads to the ${portal.sourceGroup} (${portal.dest})`);
    }
  }
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

  const [moving] = searchStateString(context.state, {
    meta: cmd.target,
    room: {
      id: room.meta.id,
    },
  });

  if (!isItem(moving)) {
    await context.focus.show(`${moving.meta.name} is not an item`);
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
  const [target] = searchStateString(context.state, {
    meta: cmd.target,
    room: {
      id: room.meta.id,
    },
  });

  if (!isItem(target)) {
    await context.focus.show(`${target.meta.name} is not a usable item`);
    return;
  }

  await context.script.invoke(target, SLOT_USE, {
    ...context,
    actor: this,
  });
}

export async function ActorStepWait(this: Actor, context: ScriptContext): Promise<void> {
  context.logger.debug('actor is skipping a turn');
}
