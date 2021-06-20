import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { isItem } from '../../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match';

export async function VerbActorEquip(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const results = await context.state.find({
    actor: {
      id: this.meta.id,
    },
    meta: {
      name: command.target,
    },
    matchers: createFuzzyMatcher(),
  });

  const item = indexEntity(results, command.index, isItem);
  if (isNil(item)) {
    await context.state.show('actor.step.equip.none', { command });
    return;
  }

  if (this.slots.has(item.slot)) {
    // TODO: should not be mutable
    this.slots.set(item.slot, item.meta.id);

    await context.state.show('actor.step.equip.item', { item });
  } else {
    await context.state.show('actor.step.equip.slot', { command, item });
  }
}
