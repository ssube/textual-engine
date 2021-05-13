import { ScriptScope, ScriptTarget } from '..';

export async function ItemStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  scope.logger.debug({
    meta: this.meta,
    scope: Object.keys(scope),
  }, 'step script');

  if (this.type === 'item') {
    scope.logger.debug(`item has ${this.slots.size} verbs`);
  }
}
