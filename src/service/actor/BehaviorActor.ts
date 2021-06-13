import { constructorName, doesExist, mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { Actor, ActorSource } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, InjectedOptions } from '../../module';
import { EVENT_ACTOR_COMMAND, EVENT_STATE_ROOM, VERB_HIT, VERB_MOVE, VERB_WAIT } from '../../util/constants';
import { EventBus } from '../event';
import { RandomGenerator } from '../random';
import { StateRoomEvent } from '../state/events';

const WAIT_CMD: Command = {
  index: 0,
  input: `${VERB_WAIT} turn`,
  verb: VERB_WAIT,
  target: 'turn',
};

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
@Inject(INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM)
export class BehaviorActorService implements ActorService {
  protected event: EventBus;
  protected logger: Logger;
  protected random: RandomGenerator;

  protected next: Map<string, Command>;

  constructor(options: InjectedOptions) {
    this.event = mustExist(options[INJECT_EVENT]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.random = mustExist(options[INJECT_RANDOM]);

    this.next = new Map();
  }

  public async start(): Promise<void> {
    this.event.on(EVENT_STATE_ROOM, (event) => {
      if (event.actor.source === ActorSource.BEHAVIOR) {
        this.onRoom(event);
      }
    }, this);
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
  }

  public async last(): Promise<Command> {
    throw new NotImplementedError();
  }

  public onRoom(event: StateRoomEvent): void {
    const behavior = this.random.nextFloat();
    this.logger.debug({ event, which: behavior }, 'received room event from state');

    // attack player if possible
    const player = event.room.actors.find((it) => it.source === ActorSource.PLAYER);
    if (doesExist(player)) {
      this.logger.debug({ event, player }, 'attacking visible player');
      this.queue(event.room, event.actor, {
        index: 0,
        input: `${VERB_HIT} ${player.meta.id}`,
        verb: VERB_HIT,
        target: player.meta.id,
      });
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

      this.queue(event.room, event.actor, {
        index: 0,
        input: `${VERB_MOVE} ${portal.sourceGroup} ${portal.name}`,
        verb: VERB_MOVE,
        target: `${portal.sourceGroup} ${portal.name}`,
      });
      return;
    }

    this.queue(event.room, event.actor, WAIT_CMD);
  }

  protected queue(room: Room, actor: Actor, command: Command): void {
    this.next.set(actor.meta.id, command);

    this.event.emit(EVENT_ACTOR_COMMAND, {
      actor,
      command,
      room,
    });
  }
}
