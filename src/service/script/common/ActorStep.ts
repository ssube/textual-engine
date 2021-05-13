import { InvalidArgumentError } from '@apextoaster/js-utils';
import { ScriptScope, ScriptTarget } from '..';
import { decrementKey } from '../../../utils/map';

export async function ActorStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  console.log('step script', this.meta.id, Object.keys(scope));

  if (this.type !== 'actor') {
    throw new InvalidArgumentError('incorrect target type');
  }

  console.log(`actor has ${this.items.length} inventory items`);

  if (Array.isArray(scope.cmds)) {
    console.log(`actor ${this.meta.name} has ${scope.cmds.length} commands to act upon`);

    for (const cmd of scope.cmds) {
      console.log(`${this.meta.name} will ${cmd.verb} the ${cmd.target}`);
    }
  }

  const hp = decrementKey(this.stats, 'health');
  if (hp <= 0) {
    console.log(`${this.meta.name} has died`);
  }
}
