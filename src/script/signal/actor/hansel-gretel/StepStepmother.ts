import { doesExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { setKey } from '../../../../util/collection/map.js';
import { STAT_HEALTH } from '../../../../util/constants.js';
import { assertActor } from '../../../../util/script/assert.js';
import { SignalActorStep } from '../ActorStep.js';

export async function SignalActorStepHGStepmother(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const deathTurn = actor.stats.get('death-turn');
  if (doesExist(deathTurn) && context.step.turn > deathTurn) {
    const stats = setKey(actor.stats, STAT_HEALTH, 0);
    await context.state.update(actor, { stats });
  }

  return SignalActorStep.call(actor, context);
}
