import { doesExist, InvalidArgumentError } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';
import { decrementKey } from '../../../utils/map';
import { Command } from '../../input';

export async function ActorStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  console.log('step script', this.meta.id, Object.keys(scope));

  if (this.type !== 'actor') {
    throw new InvalidArgumentError('incorrect target type');
  }

  console.log(`actor has ${this.items.length} inventory items`);

  if (doesExist(scope.command)) {
    const cmd = scope.command as Command;
    console.log(`${this.meta.name} will ${cmd.verb} the ${cmd.target}`);
  } else {
    console.log(`${this.meta.name} has nothing to do`);
  }

  const hp = decrementKey(this.stats, 'health');
  if (hp <= 0) {
    console.log(`${this.meta.name} has died`);
  }
}
