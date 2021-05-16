import { doesExist, InvalidArgumentError, isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';
import { WorldEntity } from '../../../model/entity';
import { Actor, ActorType, isActor } from '../../../model/entity/Actor';
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
import { searchStateString } from '../../../util/state';

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

  if (doesExist(scope.room)) {
    scope.logger.debug(`${this.meta.name} is in ${scope.room.meta.name} (${scope.room.meta.id})`);
    if (this.actorType === ActorType.PLAYER) {
      scope.logger.debug(`${this.meta.name} can see: ${scope.room.meta.desc}`);

      for (const item of scope.room.items) {
        scope.logger.debug(`${scope.room.meta.name} contains an ${item.meta.name}`);
      }
    }
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
  scope.logger.debug('take command not implemented');

  const cmd = mustExist(scope.command);
  const room = mustExist(scope.room);

  await scope.transfer.moveItem(cmd.target, this.meta.id, room.meta.id);
}

export async function ActorStepCommand(this: Actor, scope: ScriptScope): Promise<void> {
  const cmd = mustExist(scope.command);

  scope.logger.debug(`${this.meta.name} will ${cmd.verb} the ${cmd.target}`);

  const verb = knownVerbs.get(cmd.verb);
  if (doesExist(verb)) {
    await verb.call(this, scope);
  } else {
    scope.logger.warn('unknown verb');
  }
}

export async function ActorStepHit(this: Actor, scope: ScriptScope): Promise<void> {
  const cmd = mustExist(scope.command);
  const [target] = searchStateString(scope.state, cmd.target);

  if (!isActor(target)) {
    await scope.render.show(`${target} is not an actor`);
    return;
  }

  if (this.items.length === 0) {
    await scope.render.show(`You cannot hit ${target.meta.name}, you are not holding anything!`);
    return;
  }

  await scope.script.invoke(target as WorldEntity, SLOT_HIT, {
    ...scope,
    actor: target,
    item: this.items[0],
  }); // TODO: fix entity cast
}

export async function ActorStepLook(this: Actor, scope: ScriptScope): Promise<void> {
  if (doesExist(scope.room)) {
    scope.render.show(`${this.meta.name} is in ${scope.room.meta.name}: ${scope.room.meta.desc}`);

    for (const item of this.items) {
      scope.render.show(`You are holding a ${item.meta.name} (${item.meta.id})`);
    }

    for (const actor of scope.room.actors) {
      if (actor !== this) {
        scope.render.show(`A ${actor.meta.name} (${actor.meta.desc}, ${actor.meta.id}) is in the room`);
        scope.render.show(`${actor.meta.name} has ${actor.stats.get('health')} health`);
      }
    }

    for (const item of scope.room.items) {
      scope.render.show(`A ${item.meta.name} is lying on the floor (${item.meta.id})`);
    }

    for (const portal of scope.room.portals) {
      scope.render.show(`A ${portal.name} leads to the ${portal.sourceGroup} (${portal.dest})`)
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
  await scope.render.show(`${this.meta.name} moved to ${targetPortal.name}`);
  await scope.transfer.moveActor(this.meta.id, currentRoom.meta.id, targetPortal.dest);

  if (this.actorType === ActorType.PLAYER) {
    await scope.focus.setRoom(targetPortal.dest);
  }
}

export async function ActorStepTake(this: Actor, scope: ScriptScope): Promise<void> {
  scope.logger.debug('take command not implemented');

  const cmd = mustExist(scope.command);
  const room = mustExist(scope.room);

  await scope.transfer.moveItem(cmd.target, room.meta.id, this.meta.id);
}

export async function ActorStepUse(this: Actor, scope: ScriptScope): Promise<void> {
  const target = this; // TODO: find actual target
  await scope.script.invoke(target, SLOT_USE, scope);
}

export async function ActorStepWait(this: Actor, scope: ScriptScope): Promise<void> {
  scope.logger.debug('actor is skipping a turn');
}
