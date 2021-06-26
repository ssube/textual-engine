import { mustExist } from '@apextoaster/js-utils';
import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { isItem, ITEM_TYPE } from '../../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { SIGNAL_REPLACE } from '../../../util/constants';
import { createFuzzyMatcher } from '../../../util/entity/match';

export async function VerbActorReplace(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  // find the target
  const command = mustExist(context.command);
  const [targetName] = command.targets;

  const [item] = await context.state.find({
    matchers: createFuzzyMatcher(),
    meta: {
      name: targetName,
    },
    type: ITEM_TYPE,
  });

  if (!isItem(item)) {
    return context.state.show(context.source, 'actor.replace.missing', { command });
  }

  // signal the item
  return context.script.invoke(item, SIGNAL_REPLACE, context);
}
