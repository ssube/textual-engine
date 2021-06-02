import { InvalidArgumentError, isNil } from '@apextoaster/js-utils';

import { ActorType, isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { getKey } from '../../../util/collection/map';
import { STAT_HEALTH } from '../../../util/constants';

export async function ActorStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
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
      await context.stateHelper.show('actor.step.command.dead', { actor: this });
      await context.stateHelper.quit();
    }
    return;
  }

  if (isNil(context.command)) {
    context.logger.debug({ target: this }, 'actor has nothing to do');
    return;
  }

  const { command } = context;

  if (this.scripts.has(command.verb) === false) {
    await context.stateHelper.show('actor.step.command.unknown', { actor: this, command });
    context.logger.warn({ command }, 'unknown verb');
    return;
  }

  if (this.actorType === ActorType.PLAYER) {
    if (command.target.length > 0) {
      await context.stateHelper.show('actor.step.command.player.target', { actor: this, command });
    } else {
      await context.stateHelper.show('actor.step.command.player.verb', { actor: this, command });
    }
  }

  await context.script.invoke(this, command.verb, context);
}
