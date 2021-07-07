import { doesExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';
import { setKey } from '../../../../util/collection/map';
import { STAT_HEALTH } from '../../../../util/constants';
import { SignalActorStep } from '../ActorStep';

export async function SignalActorStepHGStepmother(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  const deathTurn = this.stats.get('death-turn');
  if (doesExist(deathTurn) && context.step.turn > deathTurn) {
    const stats = setKey(this.stats, STAT_HEALTH, 0);
    await context.state.update(this, { stats });
  }

  return SignalActorStep.call(this, context);
}
