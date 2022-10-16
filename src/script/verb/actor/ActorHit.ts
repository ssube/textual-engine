import { isNone, mustExist } from '@apextoaster/js-utils';

import { isActor } from '../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { head } from '../../../util/collection/array.js';
import { SIGNAL_HIT } from '../../../util/constants.js';
import { findActorSlots, findSlotItem } from '../../../util/entity/find.js';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match.js';
import { assertActor } from '../../../util/script/assert.js';

export async function VerbActorHit(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const command = mustExist(context.command);
  const room = mustExist(context.room);

  const results = await context.state.find({
    meta: {
      name: head(command.targets),
    },
    room: {
      id: room.meta.id,
    },
    matchers: createFuzzyMatcher(),
  });
  const target = indexEntity(results, command.index, isActor);

  if (isNone(target)) {
    return context.state.show(context.source, 'actor.verb.hit.type', { command });
  }

  if (actor === target) {
    return context.state.show(context.source, 'actor.verb.hit.self', { command });
  }

  const [slot] = findActorSlots(actor, 'weapon');
  const item = findSlotItem(actor, slot);

  if (isNone(item)) {
    return context.state.show(context.source, 'actor.verb.hit.item', { target });
  }

  return context.script.invoke(target, SIGNAL_HIT, {
    ...context,
    actor,
    item,
  });
}
