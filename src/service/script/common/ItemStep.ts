import { InvalidArgumentError } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '..';
import { isItem } from '../../../model/entity/Item';

export async function ItemStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  context.logger.debug({
    meta: this.meta,
    scope: Object.keys(context),
  }, 'step script');

  if (!isItem(this)) {
    throw new InvalidArgumentError('target must be an item');
  }
}
