import { InvalidArgumentError, isNil, mustExist } from '@apextoaster/js-utils';

import { ActorType, isActor } from '../../../model/entity/Actor';
import { LocaleContext } from '../../../service/locale';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { ShowVolume, StateSource } from '../../../util/actor';
import { getKey } from '../../../util/collection/map';
import { STAT_HEALTH } from '../../../util/constants';
import { getVerbScripts } from '../../../util/script';

export async function SignalActorStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  context.logger.debug({
    meta: this.meta,
    scope: Object.keys(context),
  }, 'step script');

  if (!isActor(this)) {
    throw new InvalidArgumentError('script target must be an actor');
  }

  const health = getKey(this.stats, STAT_HEALTH, 0);
  if (health <= 0) {
    if (this.actorType === ActorType.PLAYER) {
      await context.state.show('actor.step.command.dead', { actor: this });
      await context.state.quit();
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
    await context.state.show('actor.step.command.unknown', showContext, ShowVolume.SELF, source);
    context.logger.warn({ command }, 'unknown verb');
    return;
  }

  if (this.actorType === ActorType.PLAYER) {
    if (command.target.length > 0) {
      await context.state.show('actor.step.command.player.target', showContext, ShowVolume.SELF, source);
    } else {
      await context.state.show('actor.step.command.player.verb', showContext, ShowVolume.SELF, source);
    }
  }

  return context.script.invoke(this, command.verb, context);
}
