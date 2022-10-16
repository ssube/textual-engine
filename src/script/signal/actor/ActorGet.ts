import { mustExist } from '@apextoaster/js-utils';

import { ActorSource } from '../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { assertActor } from '../../../util/script/assert.js';

export async function SignalActorGet(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  if (actor.source === ActorSource.PLAYER) {
    const item = mustExist(context.item);
    await context.state.show(context.source, 'actor.signal.get.item', { item });
  }
}
