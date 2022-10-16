import { isNone } from '@apextoaster/js-utils';

import { WorldEntityType } from '../../../model/entity/index.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { assertItem } from '../../../util/script/assert.js';
import { SPLIT_LIMIT, splitChain } from '../../../util/template/SplitChain.js';

export async function SignalItemReplace(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const item = assertItem(this);

  const replaceStr = item.flags.get('replace');
  if (isNone(replaceStr)) {
    return context.state.show(context.source, 'item.replace.missing', { item });
  }

  // TODO: use join helper and respect normal ordering of and/or groups
  const replaceGroups = splitChain(replaceStr, {
    group: {
      end: ')',
      start: '(',
    },
    split: '|',
  }).flat(SPLIT_LIMIT) as Array<string>;

  context.logger.debug({ item: this, replaceGroups }, 'replace groups for item');

  for (const group of replaceGroups) {
    const [type, id] = group.split(':');
    const entity = await context.state.create(id, type as WorldEntityType, context.source);
    await context.state.show(context.source, 'item.replace.entity', { entity, item });
  }

  await context.state.show(context.source, 'item.replace.done', { item });
}
