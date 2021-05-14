import { doesExist, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';
import { Actor, ActorType } from '../../../model/entity/Actor';
import { decrementKey, getKey } from '../../../util/map';

export async function ActorStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  scope.logger.debug({
    meta: this.meta,
    scope: Object.keys(scope),
  }, 'step script');

  if (this.type !== 'actor') {
    throw new InvalidArgumentError('incorrect target type');
  }

  if (getKey(this.stats, 'health') <= 0) {
    scope.logger.debug(`${this.meta.name} is dead`);
    return;
  } else {
    decrementKey(this.stats, 'health');
  }

  scope.logger.debug(`actor has ${this.items.length} inventory items`);

  if (doesExist(scope.room)) {
    scope.logger.debug(`${this.meta.name} is in ${scope.room.meta.name}`);
    if (this.actorType === ActorType.PLAYER) {
      scope.logger.debug(`${this.meta.name} can see: ${scope.room.meta.desc}`);

      for (const item of scope.room.items) {
        scope.logger.debug(`${scope.room.meta.name} contains an ${item.meta.name}`);
      }
    }
  }

  if (doesExist(scope.command)) {
    scope.logger.debug(`${this.meta.name} will ${scope.command.verb} the ${scope.command.target}`);
    await ActorStepCommand.call(this, scope);
  } else {
    scope.logger.debug(`${this.meta.name} has nothing to do`);
  }
}

export async function ActorStepCommand(this: Actor, scope: ScriptScope): Promise<void> {
  const cmd = mustExist(scope.command);

  switch (cmd.verb) {
    case 'hit': {
      const target = this; // TODO: find actual target
      scope.script.invoke(target, 'hit', scope);
      break;
    }
    case 'move':
      scope.logger.debug('move command not implemented');
      break;
    case 'take':
      scope.logger.debug('take command not implemented');
      break;
    case 'use': {
      const target = this; // TODO: find actual target
      scope.script.invoke(target, 'use', scope);
      break;
    }
    default:
      scope.logger.warn('unknown verb');
  }
}
