import { doesExist, InvalidArgumentError } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';
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

  if (doesExist(scope.command)) {
    scope.logger.debug(`${this.meta.name} will ${scope.command.verb} the ${scope.command.target}`);
  } else {
    scope.logger.debug(`${this.meta.name} has nothing to do`);
  }
}
