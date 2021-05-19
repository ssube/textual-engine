import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '..';
import { ActorType, isActor } from '../../../model/entity/Actor';

export async function ActorGet(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new InvalidArgumentError('invalid entity type');
  }

  if (this.actorType === ActorType.PLAYER) {
    const item = mustExist(context.item);
    await context.focus.show(`You have picked up a ${item.meta.name}: ${item.meta.desc} (${item.meta.id})`);
  }
}
