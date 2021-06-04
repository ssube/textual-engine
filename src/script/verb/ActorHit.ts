import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../error/ScriptTargetError';
import { isActor } from '../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../service/script';
import { ShowVolume } from '../../util/actor';
import { SLOT_HIT } from '../../util/constants';
import { FUZZY_MATCHERS, indexEntity } from '../../util/entity';
import { searchState } from '../../util/state';

export async function VerbActorHit(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);

  const results = searchState(context.state, {
    meta: {
      name: command.target,
    },
    room: {
      id: room.meta.id,
    },
  }, FUZZY_MATCHERS);
  const target = indexEntity(results, command.index, isActor);

  if (isNil(target)) {
    await context.stateHelper.show('actor.step.hit.type', { command }, ShowVolume.SELF, {
      actor: this,
      room,
    });
    return;
  }

  if (this === target) {
    await context.stateHelper.show('actor.step.hit.self', { command }, ShowVolume.SELF, {
      actor: this,
      room,
    });
    return;
  }

  if (this.items.length === 0) {
    await context.stateHelper.show('actor.step.hit.item', { target }, ShowVolume.SELF, {
      actor: this,
      room,
    });
    return;
  }

  await context.script.invoke(target, SLOT_HIT, {
    ...context,
    actor: this,
    item: this.items[0],
  });
}
