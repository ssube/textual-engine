import { ScriptContext, ScriptTarget } from '..';
import { isItem } from '../../../model/entity/Item';

export async function ItemStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  context.logger.debug({
    meta: this.meta,
    scope: Object.keys(context),
  }, 'step script');

  if (!isItem(this)) {
    context.logger.debug(`item has ${this.slots.size} verbs`);
  }
}
