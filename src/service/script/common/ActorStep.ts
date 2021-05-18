import { doesExist, InvalidArgumentError, isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';
import { WorldEntity } from '../../../model/entity';
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
import { decrementKey, getKey } from '../../../util/map';
import { searchStateString } from '../../../util/state/search';

export async function ActorStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  scope.logger.debug({
    meta: this.meta,
    scope: Object.keys(scope),
  }, 'step script');

  if (!isActor(this)) {
    throw new InvalidArgumentError('script target must be an actor');
  }

  if (getKey(this.stats, 'health') <= 0) {
    scope.logger.debug(`${this.meta.name} is dead`);
    return;
  } else {
    decrementKey(this.stats, 'health');
  }

  if (doesExist(scope.command)) {
    await ActorStepCommand.call(this, scope);
  } else {
    scope.logger.debug(`${this.meta.name} has nothing to do`);
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

export async function ActorStepDrop(this: Actor, scope: ScriptScope): Promise<void> {
  const cmd = mustExist(scope.command);
  const room = mustExist(scope.room);

  await scope.transfer.moveItem({
    moving: cmd.target,
    source: this.meta.id,
    target: room.meta.id,
  }, scope);
}

export async function ActorStepCommand(this: Actor, scope: ScriptScope): Promise<void> {
  const cmd = mustExist(scope.command);
  const verb = knownVerbs.get(cmd.verb);

  if (doesExist(verb)) {
    if (this.actorType === ActorType.PLAYER) {
      await scope.focus.show(`${this.meta.name} will ${cmd.verb} the ${cmd.target}`);
    }

    await verb.call(this, scope);
  } else {
    await scope.focus.show(`${this.meta.name} does not know how to ${cmd.verb}!`);
    scope.logger.warn('unknown verb');
  }
}

export async function ActorStepHit(this: Actor, scope: ScriptScope): Promise<void> {
  const cmd = mustExist(scope.command);
  const room = mustExist(scope.room);

  const [target] = searchStateString(scope.state, {
    meta: cmd.target,
    room: {
      id: room.meta.id,
    },
  });

  if (!isActor(target)) {
    await scope.focus.show(`${target} is not an actor`);
    return;
  }

  if (this.items.length === 0) {
    await scope.focus.show(`You cannot hit ${target.meta.name}, you are not holding anything!`);
    return;
  }

  await scope.script.invoke(target, SLOT_HIT, {
    ...scope,
    actor: this,
    item: this.items[0],
  });
}

export async function ActorStepLook(this: Actor, scope: ScriptScope): Promise<void> {
  if (doesExist(scope.room)) {
    await scope.focus.show(`${this.meta.name} is in ${scope.room.meta.name} (${scope.room.meta.id}): ${scope.room.meta.desc}`);

    for (const item of this.items) {
      await scope.focus.show(`You are holding a ${item.meta.name} (${item.meta.id})`);
    }

    for (const actor of scope.room.actors) {
      if (actor !== this) {
        await scope.focus.show(`A ${actor.meta.name} (${actor.meta.desc}, ${actor.meta.id}) is in the room`);
        const health = getKey(actor.stats, 'health', 0);
        if (health <= 0) {
          await scope.focus.show(`${actor.meta.name} is dead`);
        }
      }
    }

    for (const item of scope.room.items) {
      await scope.focus.show(`A ${item.meta.name} is lying on the floor (${item.meta.id})`);
    }

    for (const portal of scope.room.portals) {
      await scope.focus.show(`A ${portal.name} leads to the ${portal.sourceGroup} (${portal.dest})`);
    }
  }
}

export async function ActorStepMove(this: Actor, scope: ScriptScope): Promise<void> {
  // find the new room
  const currentRoom = mustExist(scope.room);
  const targetName = mustExist(scope.command).target;

  const targetPortal = currentRoom.portals.find((it) => it.name === targetName);
  if (isNil(targetPortal)) {
    scope.logger.warn({
      portals: currentRoom.portals,
    }, `portal ${targetName} not found`);
    return;
  }

  // move the actor and focus
  await scope.focus.show(`${this.meta.name} moved to ${targetPortal.name}`);
  await scope.transfer.moveActor({
    moving: this.meta.id,
    source: currentRoom.meta.id,
    target: targetPortal.dest
  }, scope);

  if (this.actorType === ActorType.PLAYER) {
    await scope.focus.setRoom(targetPortal.dest);
  }
}

export async function ActorStepTake(this: Actor, scope: ScriptScope): Promise<void> {
  const cmd = mustExist(scope.command);
  const room = mustExist(scope.room);
  scope.logger.debug({ cmd, room }, 'taking item from room');

  const [target] = searchStateString(scope.state, {
    meta: cmd.target,
    room: {
      id: room.meta.id,
    },
  });

  if (!isItem(target)) {
    await scope.focus.show(`${target.meta.name} is not an item`);
    return;
  }

  await scope.transfer.moveItem({
    moving: target.meta.id,
    source: room.meta.id,
    target: this.meta.id
  }, scope);
}

export async function ActorStepUse(this: Actor, scope: ScriptScope): Promise<void> {
  const cmd = mustExist(scope.command);
  const room = mustExist(scope.room);
  const [target] = searchStateString(scope.state, {
    meta: cmd.target,
    room: {
      id: room.meta.id,
    },
  });

  if (!isItem(target)) {
    await scope.focus.show(`${target.meta.name} is not a usable item`);
    return;
  }

  await scope.script.invoke(target, SLOT_USE, {
    ...scope,
    actor: this,
  });
}

export async function ActorStepWait(this: Actor, scope: ScriptScope): Promise<void> {
  scope.logger.debug('actor is skipping a turn');
}
