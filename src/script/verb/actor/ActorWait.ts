import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { assertActor } from '../../../util/script/assert.js';

export async function VerbActorWait(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  context.logger.debug({ target: actor }, 'actor is skipping a turn');
}
