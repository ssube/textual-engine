import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { getKey } from '../../../util/collection/map.js';
import { SIGNAL_LOOK, STAT_HEALTH } from '../../../util/constants.js';
import { assertActor } from '../../../util/script/assert.js';

export async function SignalActorLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const health = getKey(actor.stats, STAT_HEALTH, 0);

  if (actor === context.actor) {
    await context.state.show(context.source, 'actor.signal.look.self', { actor });

    if (health > 0) {
      await context.state.show(context.source, 'actor.signal.look.health', { actor, health });
    }

    for (const item of actor.items) {
      await context.script.invoke(item, SIGNAL_LOOK, context);
    }
  } else {
    await context.state.show(context.source, 'actor.signal.look.seen', { actor });
  }

  if (health <= 0) {
    await context.state.show(context.source, 'actor.signal.look.dead', { actor });
  }
}
