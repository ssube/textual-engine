import { mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { ShowVolume } from '../../../util/actor/index.js';
import { head } from '../../../util/collection/array.js';
import { assertActor } from '../../../util/script/assert.js';

export async function VerbActorSay(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const command = mustExist(context.command);
  const line = head(command.targets);
  return context.state.show(context.source, 'actor.verb.say.line', { actor, line }, ShowVolume.ROOM);
}
