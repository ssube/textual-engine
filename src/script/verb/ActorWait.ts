import { ScriptTargetError } from '../../error/ScriptTargetError';
import { isActor } from '../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../service/script';

export async function VerbActorWait(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  context.logger.debug({ target: this }, 'actor is skipping a turn');
}
