import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { ActorSource, isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function SignalActorGet(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  if (this.source === ActorSource.PLAYER) {
    const item = mustExist(context.item);
    await context.state.show(context.source, 'actor.get.player', { item });
  }
}
