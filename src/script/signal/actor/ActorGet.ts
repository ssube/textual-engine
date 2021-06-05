import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../service/script';
import { ActorType, isActor } from '../../../model/entity/Actor';

export async function SignalActorGet(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new InvalidArgumentError('invalid entity type');
  }

  if (this.actorType === ActorType.PLAYER) {
    const item = mustExist(context.item);
    await context.state.show('actor.get.player', { item });
  }
}
