import { mustExist } from '@apextoaster/js-utils';

import { isItem, ITEM_TYPE } from '../../../model/entity/Item.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { SIGNAL_REPLACE } from '../../../util/constants.js';
import { createFuzzyMatcher } from '../../../util/entity/match.js';
import { assertActor } from '../../../util/script/assert.js';

export async function VerbActorReplace(this: ScriptTarget, context: ScriptContext): Promise<void> {
  assertActor(this);

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

  if (isItem(item) === false) {
    return context.state.show(context.source, 'actor.verb.replace.missing', { command });
  }

  // signal the item
  return context.script.invoke(item, SIGNAL_REPLACE, context);
}
