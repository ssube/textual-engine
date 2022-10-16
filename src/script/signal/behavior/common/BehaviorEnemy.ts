import { doesExist, mustExist } from '@apextoaster/js-utils';

import { makeCommand } from '../../../../model/Command.js';
import { ActorSource } from '../../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { randomItem } from '../../../../util/collection/array.js';
import { getKey } from '../../../../util/collection/map.js';
import { VERB_HIT, VERB_MOVE, VERB_WAIT } from '../../../../util/constants.js';
import { assertActor } from '../../../../util/script/assert.js';

export const WANDER_RATE = 0.25;

export async function SignalBehaviorEnemy(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const room = mustExist(context.room);

  // attack player if possible
  const player = room.actors.find((it) => it.source === ActorSource.PLAYER);
  const attack = getKey(actor.stats, 'attack', 1.00);
  if (behavior < attack && doesExist(player)) {
    context.logger.debug({ player }, 'attacking visible player');
    return context.behavior.queue(actor, makeCommand(VERB_HIT, player.meta.id));
  }

  // or randomly move
  const portals = room.portals.filter((it) => it.dest.length > 0);
  const wander = getKey(actor.stats, 'wander', WANDER_RATE);
  if (behavior < wander && portals.length > 0) {
    const portal = randomItem(portals, context.random);
    context.logger.debug({
      portal,
      portalCount: portals.length,
    }, 'moving through random portal');

    return context.behavior.queue(actor, makeCommand(VERB_MOVE, portal.meta.id));
  }

  return context.behavior.queue(actor, makeCommand(VERB_WAIT));
}
