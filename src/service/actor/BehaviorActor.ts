import { constructorName, doesExist, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { ActorType } from '../../model/entity/Actor';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM } from '../../module';
import { EVENT_STATE_ROOM, VERB_HIT, VERB_MOVE, VERB_WAIT } from '../../util/constants';
import { EventBus, RoomEvent } from '../event';
import { RandomGenerator } from '../random';

const WAIT_CMD: Command = {
  index: 0,
  input: `${VERB_WAIT} turn`,
  verb: VERB_WAIT,
  target: 'turn',
};

export interface BehaviorActorOptions extends BaseOptions {
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOGGER]?: Logger;
  [INJECT_RANDOM]?: RandomGenerator;
  actor?: string;
}

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
@Inject(INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM)
export class BehaviorActorService implements ActorService {
  protected actor: string;
  protected event: EventBus;
  protected logger: Logger;
  protected next: Command;
  protected random: RandomGenerator;

  constructor(options: BehaviorActorOptions) {
    this.actor = mustExist(options.actor);
    this.event = mustExist(options[INJECT_EVENT]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.random = mustExist(options[INJECT_RANDOM]);

    this.next = WAIT_CMD;
  }

  public async start() {
    this.event.on(EVENT_STATE_ROOM, (event) => {
      if (this.actor === event.actor.meta.id) {
        this.onRoom(event);
      }
    });
  }

  public async stop() {
    /* noop */
  }

  public async last(): Promise<Command> {
    return this.next;
  }

  public onRoom(event: RoomEvent) {
    const behavior = this.random.nextFloat();
    this.logger.debug({ event, which: behavior }, 'received room event from state');

    // attack player if possible
    const player = event.room.actors.find((it) => it.actorType === ActorType.PLAYER);
    if (doesExist(player)) {
      this.logger.debug({ event, player }, 'attacking visible player');
      this.next = {
        index: 0,
        input: `${VERB_HIT} ${player.meta.id}`,
        verb: VERB_HIT,
        target: player.meta.id,
      };
      return;
    }

    // 25% chance to move
    if (behavior < 0.25 && event.room.portals.length > 0) {
      const portalIndex = this.random.nextInt(event.room.portals.length);
      const portal = event.room.portals[portalIndex];
      this.logger.debug({
        event,
        portal,
        portalCount: event.room.portals.length,
        portalIndex,
      }, 'moving through random portal');

      this.next = {
        index: 0,
        input: `${VERB_MOVE} ${portal.sourceGroup} ${portal.name}`,
        verb: VERB_MOVE,
        target: `${portal.sourceGroup} ${portal.name}`,
      };
      return;
    }

    this.next = WAIT_CMD;
  }
}
