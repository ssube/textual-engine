import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { getKey } from '../../../util/collection/map';
import { SIGNAL_LOOK, STAT_HEALTH } from '../../../util/constants';

export async function SignalActorLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const health = getKey(this.stats, STAT_HEALTH, 0);

  if (this === context.actor) {
    await context.state.show(context.source, 'actor.signal.look.self', { actor: this });

    if (health > 0) {
      await context.state.show(context.source, 'actor.signal.look.health', { actor: this, health });
    }

    for (const item of this.items) {
      await context.script.invoke(item, SIGNAL_LOOK, context);
    }
  } else {
    await context.state.show(context.source, 'actor.signal.look.seen', { actor: this });
  }

  if (health <= 0) {
    await context.state.show(context.source, 'actor.signal.look.dead', { actor: this });
  }
}
