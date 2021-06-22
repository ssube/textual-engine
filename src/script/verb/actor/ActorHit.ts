import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { head } from '../../../util/collection/array';
import { SIGNAL_HIT } from '../../../util/constants';
import { findActorSlots, findSlotItem } from '../../../util/entity/find';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match';

export async function VerbActorHit(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const actor = this;
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

  if (isNil(target)) {
    await context.state.show(context.source, 'actor.step.hit.type', { command });
    return;
  }

  if (this === target) {
    await context.state.show(context.source, 'actor.step.hit.self', { command });
    return;
  }

  const [slot] = findActorSlots(this, 'weapon');
  const item = findSlotItem(actor, slot);

  if (isNil(item)) {
    await context.state.show(context.source, 'actor.step.hit.item', { target });
    return;
  }

  await context.script.invoke(target, SIGNAL_HIT, {
    ...context,
    actor,
    item,
  });
}
