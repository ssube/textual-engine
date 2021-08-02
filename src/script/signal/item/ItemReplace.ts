import { isNil } from '@apextoaster/js-utils';
import { ScriptTargetError } from '../../../error/ScriptTargetError.js';
import { WorldEntityType } from '../../../model/entity/index.js';
import { isItem } from '../../../model/entity/Item.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { splitChain } from '../../../util/template/SplitChain.js';

export async function SignalItemReplace(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isItem(this)) {
    throw new ScriptTargetError('script target must be an item');
  }

  const replaceStr = this.flags.get('replace');
  if (isNil(replaceStr)) {
    return context.state.show(context.source, 'item.replace.missing', { item: this });
  }

  // TODO: use join helper and respect normal ordering of and/or groups
  const replaceGroups = splitChain(replaceStr, {
    group: {
      end: ')',
      start: '(',
    },
    split: '|',
  }).flat(Infinity) as Array<string>;

  context.logger.debug({ item: this, replaceGroups }, 'replace groups for item');

  for (const group of replaceGroups) {
    const [type, id] = group.split(':');
    const entity = await context.state.create(id, type as WorldEntityType, context.source);
    await context.state.show(context.source, 'item.replace.entity', { entity, item: this });
  }

  await context.state.show(context.source, 'item.replace.done', { item: this });
}
