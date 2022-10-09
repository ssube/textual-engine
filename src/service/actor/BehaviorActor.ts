import { doesExist, mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';
import { Inject, Logger } from 'noicejs';

import { ActorService } from './index.js';
import { ConfigError } from '../../error/ConfigError.js';
import { Command, makeCommand } from '../../model/Command.js';
import { ActorSource, ReadonlyActor } from '../../model/entity/Actor.js';
import { ReadonlyRoom } from '../../model/entity/Room.js';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, InjectedOptions } from '../../module/index.js';
import { catchAndLog } from '../../util/async/event.js';
import { randomItem } from '../../util/collection/array.js';
import { EVENT_ACTOR_COMMAND, EVENT_STATE_ROOM, VERB_HIT, VERB_MOVE, VERB_WAIT } from '../../util/constants.js';
import { makeSchema } from '../../util/schema/index.js';
import { makeServiceLogger } from '../../util/service/index.js';
import { EventBus } from '../event/index.js';
import { RandomService } from '../random/index.js';
import { StateRoomEvent } from '../state/events.js';

export interface BehaviorActorConfig {
  attack: number;
  wander: number;
}

export const BEHAVIOR_ACTOR_SCHEMA: JSONSchemaType<BehaviorActorConfig> = {
  type: 'object',
  properties: {
    attack: {
      type: 'number',
      default: 1.00,
    },
    wander: {
      type: 'number',
      default: 0.25,
    },
  },
  required: [],
};

const WAIT_CMD: Command = makeCommand(VERB_WAIT, 'turn');

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
@Inject(INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM)
export class BehaviorActorService implements ActorService {
  protected config: BehaviorActorConfig;
  protected event: EventBus;
  protected logger: Logger;
  protected random: RandomService;

  protected next: Map<string, Command>;

  constructor(options: InjectedOptions) {
    const config = mustExist(options.config);
    const schema = makeSchema(BEHAVIOR_ACTOR_SCHEMA);
    if (!schema(config)) {
      throw new ConfigError('invalid service config');
    }

    this.config = config;
    this.event = mustExist(options[INJECT_EVENT]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
    this.random = mustExist(options[INJECT_RANDOM]);

    this.next = new Map();
  }

  public async start(): Promise<void> {
    this.event.on(EVENT_STATE_ROOM, (event) => {
      if (event.actor.source === ActorSource.BEHAVIOR) {
        catchAndLog(this.onRoom(event), this.logger, 'error during room event');
      }
    }, this);
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
  }

  public async last(): Promise<Command> {
    throw new NotImplementedError();
  }

  public async onRoom(event: StateRoomEvent): Promise<void> {
    const behavior = this.random.nextFloat();
    this.logger.debug({ event, which: behavior }, 'received room event from state');

    // attack player if possible
    const player = event.room.actors.find((it) => it.source === ActorSource.PLAYER);
    if (behavior < this.config.attack && doesExist(player)) {
      this.logger.debug({ event, player }, 'attacking visible player');
      return this.queue(event.room, event.actor, makeCommand(VERB_HIT, player.meta.id));
    }

    // or randomly move
    const portals = event.room.portals.filter((it) => it.dest.length > 0);
    if (behavior < this.config.wander && portals.length > 0) {
      const portal = randomItem(portals, this.random);
      this.logger.debug({
        event,
        portal,
        portalCount: portals.length,
      }, 'moving through random portal');

      return this.queue(event.room, event.actor, makeCommand(VERB_MOVE, portal.meta.id));
    }

    return this.queue(event.room, event.actor, WAIT_CMD);
  }

  protected async queue(room: ReadonlyRoom, actor: ReadonlyActor, command: Command): Promise<void> {
    this.next.set(actor.meta.id, command);

    this.event.emit(EVENT_ACTOR_COMMAND, {
      actor,
      command,
      room,
    });
  }
}
