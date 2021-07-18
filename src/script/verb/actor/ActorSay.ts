import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { ShowVolume } from '../../../util/actor';
import { head } from '../../../util/collection/array';

export async function VerbActorSay(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const line = head(command.targets);
  return context.state.show(context.source, 'actor.verb.say.line', { actor: this, line }, ShowVolume.ROOM);
}
