import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { ActorType, isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function SignalActorGet(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('invalid entity type');
  }

  if (this.actorType === ActorType.PLAYER) {
    const item = mustExist(context.item);
    await context.state.show('actor.get.player', { item });
  }
}
