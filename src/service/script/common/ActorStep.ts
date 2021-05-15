import { doesExist, InvalidArgumentError, isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';
import { Actor, ActorType, isActor } from '../../../model/entity/Actor';
import { SLOT_HIT, SLOT_LOOK, SLOT_MOVE, SLOT_TAKE, SLOT_USE, SLOT_WAIT } from '../../../util/constants';
import { decrementKey, getKey } from '../../../util/map';

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
  [SLOT_HIT, ActorStepHit],
  [SLOT_LOOK, ActorStepLook],
  [SLOT_MOVE, ActorStepMove],
  [SLOT_TAKE, ActorStepTake],
  [SLOT_USE, ActorStepUse],
  [SLOT_WAIT, ActorStepWait],
]);

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
  const target = this; // TODO: find actual target
  await scope.script.invoke(target, SLOT_HIT, scope);
}

export async function ActorStepLook(this: Actor, scope: ScriptScope): Promise<void> {
  if (doesExist(scope.room)) {
    scope.render.show(`${this.meta.name} is in ${scope.room.meta.name}: ${scope.room.meta.desc}`);

    for (const actor of scope.room.actors) {
      if (actor !== this) {
        scope.render.show(`A ${actor.meta.name} is in the room with ${actor.stats.get('health')} health`);
      }
    }

    for (const item of scope.room.items) {
      scope.render.show(`A ${item.meta.name} is in lying on the floor`);
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
}

export async function ActorStepUse(this: Actor, scope: ScriptScope): Promise<void> {
  const target = this; // TODO: find actual target
  await scope.script.invoke(target, SLOT_USE, scope);
}

export async function ActorStepWait(this: Actor, scope: ScriptScope): Promise<void> {
  scope.logger.debug('actor is skipping a turn');
}
