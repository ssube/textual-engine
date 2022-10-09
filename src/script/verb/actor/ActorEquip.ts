import { defaultWhen, isNone, lengthOf, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError.js';
import { isActor } from '../../../model/entity/Actor.js';
import { isItem } from '../../../model/entity/Item.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { head } from '../../../util/collection/array.js';
import { setKey } from '../../../util/collection/map.js';
import { findActorSlots } from '../../../util/entity/find.js';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match.js';
import { hasText, matchIdSegments } from '../../../util/string.js';

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
  if (isNone(item)) {
    return context.state.show(context.source, 'actor.verb.equip.missing', { command });
  }

  // use the requested slot or default to the item's preferred slot
  const slotName = defaultWhen(hasText(targetSlot), targetSlot, item.slot);
  context.logger.debug({ item, slotName, targetSlot }, 'testing target slot for item');

  if (matchIdSegments(slotName, item.slot) === false) {
    return context.state.show(context.source, 'actor.verb.equip.slot.invalid', { item, slot: slotName });
  }

  const validSlots = findActorSlots(this, slotName);
  if (lengthOf(validSlots) === 0) {
    return context.state.show(context.source, 'actor.verb.equip.slot.missing', { item, slot: slotName });
  }

  const slot = head(validSlots);
  const slots = setKey(this.slots, slot, item.meta.id);
  await context.state.update(this, { slots });
  return context.state.show(context.source, 'actor.verb.equip.item', { item, slot });
}
