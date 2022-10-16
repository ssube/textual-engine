import { isNone, mustExist } from '@apextoaster/js-utils';

import { ActorSource } from '../../../model/entity/Actor.js';
import { LocaleContext } from '../../../service/locale/index.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { StateSource } from '../../../util/actor/index.js';
import { getKey } from '../../../util/collection/map.js';
import { STAT_HEALTH, STAT_SCORE } from '../../../util/constants.js';
import { assertActor } from '../../../util/script/assert.js';
import { getVerbScripts } from '../../../util/script/index.js';

export async function SignalActorStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const health = getKey(actor.stats, STAT_HEALTH, 0);
  if (health <= 0) {
    if (actor.source === ActorSource.PLAYER) {
      await context.state.show(context.source, 'actor.signal.step.dead', { actor });
      await context.state.quit('quit.dead', { actor }, [STAT_SCORE]);
    }
    return;
  }

  if (isNone(context.command)) {
    context.logger.debug({ target: actor }, 'actor has nothing to do');
    return;
  }

  const { command } = context;

  const showContext: LocaleContext = {
    actor,
    command,
  };
  const source: StateSource = {
    actor,
    room: mustExist(context.room),
  };

  const scripts = getVerbScripts(source);
  if (scripts.has(command.verb) === false) {
    context.logger.warn({ command }, 'unknown verb');
    return context.state.show(context.source, 'actor.signal.step.verb.missing', showContext);
  }

  if (actor.source === ActorSource.PLAYER) {
    if (command.targets.length > 0) {
      await context.state.show(context.source, 'actor.signal.step.verb.target', showContext);
    } else {
      await context.state.show(context.source, 'actor.signal.step.verb.player', showContext);
    }
  }

  return context.script.invoke(actor, command.verb, context);
}
