import { doesExist, mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command, makeCommand } from '../../model/Command';
import { Actor, ActorSource } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, InjectedOptions } from '../../module';
import { randomItem } from '../../util/collection/array';
import {
  BEHAVIOR_WANDER,
  EVENT_ACTOR_COMMAND,
  EVENT_STATE_ROOM,
  VERB_HIT,
  VERB_MOVE,
  VERB_WAIT,
} from '../../util/constants';
import { makeServiceLogger } from '../../util/service';
import { EventBus } from '../event';
import { RandomGenerator } from '../random';
import { StateRoomEvent } from '../state/events';

const WAIT_CMD: Command = makeCommand(VERB_WAIT, 'turn');

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
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
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
      this.queue(event.room, event.actor, makeCommand(VERB_HIT, player.meta.id));
      return;
    }

    // 25% chance to move
    const portals = event.room.portals.filter((it) => it.dest.length > 0);
    if (behavior < BEHAVIOR_WANDER && portals.length > 0) {
      const portal = randomItem(portals, this.random);
      this.logger.debug({
        event,
        portal,
        portalCount: portals.length,
      }, 'moving through random portal');

      this.queue(event.room, event.actor, makeCommand(VERB_MOVE, portal.meta.id));
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
