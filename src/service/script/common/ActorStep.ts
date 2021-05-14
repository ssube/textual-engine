import { doesExist, InvalidArgumentError, isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';
import { Actor, ActorType } from '../../../model/entity/Actor';
import { Room } from '../../../model/entity/Room';
import { decrementKey, getKey } from '../../../util/map';

export async function ActorStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  scope.logger.debug({
    meta: this.meta,
    scope: Object.keys(scope),
  }, 'step script');

  if (this.type !== 'actor') {
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
  ['hit', ActorStepHit],
  ['move', ActorStepMove],
  ['take', ActorStepTake],
  ['use', ActorStepUse],
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
  await scope.script.invoke(target, 'hit', scope);
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
  await scope.script.invoke(target, 'use', scope);
}
