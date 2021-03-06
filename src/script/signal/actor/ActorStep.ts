import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { ActorSource, isActor } from '../../../model/entity/Actor';
import { LocaleContext } from '../../../service/locale';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { StateSource } from '../../../util/actor';
import { getKey } from '../../../util/collection/map';
import { STAT_HEALTH, STAT_SCORE } from '../../../util/constants';
import { getVerbScripts } from '../../../util/script';

export async function SignalActorStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const health = getKey(this.stats, STAT_HEALTH, 0);
  if (health <= 0) {
    if (this.source === ActorSource.PLAYER) {
      await context.state.show(context.source, 'actor.signal.step.dead', { actor: this });
      await context.state.quit('quit.dead', { actor: this }, [STAT_SCORE]);
    }
    return;
  }

  if (isNil(context.command)) {
    context.logger.debug({ target: this }, 'actor has nothing to do');
    return;
  }

  const { command } = context;

  const showContext: LocaleContext = {
    actor: this,
    command,
  };
  const source: StateSource = {
    actor: this,
    room: mustExist(context.room),
  };

  const scripts = getVerbScripts(source);
  if (scripts.has(command.verb) === false) {
    context.logger.warn({ command }, 'unknown verb');
    return context.state.show(context.source, 'actor.signal.step.verb.missing', showContext);
  }

  if (this.source === ActorSource.PLAYER) {
    if (command.targets.length > 0) {
      await context.state.show(context.source, 'actor.signal.step.verb.target', showContext);
    } else {
      await context.state.show(context.source, 'actor.signal.step.verb.player', showContext);
    }
  }

  return context.script.invoke(this, command.verb, context);
}
