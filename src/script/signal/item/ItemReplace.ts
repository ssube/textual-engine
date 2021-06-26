import { isNil } from '@apextoaster/js-utils';
import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { WorldEntityType } from '../../../model/entity';
import { isItem } from '../../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { splitChain } from '../../../util/template/SplitChain';

export async function SignalItemReplace(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isItem(this)) {
    throw new ScriptTargetError('script target must be an item');
  }

  const replaceStr = this.flags.get('replace');
  if (isNil(replaceStr)) {
    return context.state.show(context.source, 'item.replace.none', { item: this });
  }

  // TODO: respect normal and/or groups
  const replaceGroups = splitChain(replaceStr, {
    group: {
      end: ')',
      start: '(',
    },
    split: '|',
  }).flat(Infinity) as Array<string>;

  console.log('replace groups', replaceGroups);

  for (const group of replaceGroups) {
    const [type, id] = group.split(':');
    const entity = await context.state.create(id, type as WorldEntityType, context.source);
    await context.state.show(context.source, 'item.replace.entity', { entity, item: this });
  }

  await context.state.show(context.source, 'item.replace.done', { item: this });
}
