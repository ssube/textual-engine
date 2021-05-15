import { ScriptScope, ScriptTarget } from '..';
import { isItem } from '../../../model/entity/Item';

export async function ItemStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  scope.logger.debug({
    meta: this.meta,
    scope: Object.keys(scope),
  }, 'step script');

  if (!isItem(this)) {
    scope.logger.debug(`item has ${this.slots.size} verbs`);
  }
}
