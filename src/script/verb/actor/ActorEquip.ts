import { isNil, mustCoalesce, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { isItem } from '../../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { findActorSlots } from '../../../util/entity/find';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match';

export async function VerbActorEquip(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const [targetName, targetSlot] = command.targets;

  const results = await context.state.find({
    actor: {
      id: this.meta.id,
    },
    meta: {
      name: targetName,
    },
    matchers: createFuzzyMatcher(),
  });

  const item = indexEntity(results, command.index, isItem);
  if (isNil(item)) {
    await context.state.show('actor.step.equip.none', { command });
    return;
  }

  // use the requested slot or default to the item's preferred slot
  const slotName = mustCoalesce(targetSlot, item.slot);
  const [slot] = findActorSlots(this, slotName);

  if (this.slots.has(slot)) {
    // TODO: should not be mutable
    this.slots.set(slot, item.meta.id);

    await context.state.show('actor.step.equip.item', { item, slot });
  } else {
    await context.state.show('actor.step.equip.slot', { item, slot });
  }
}
