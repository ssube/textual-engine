import { constructorName, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { INJECT_EVENT, INJECT_LOGGER } from '../../module';
import { VERB_WAIT } from '../../util/constants';
import { EventBus, RoomEvent } from '../event';

const WAIT_CMD: Command = {
  index: 0,
  input: `${VERB_WAIT} turn`,
  verb: VERB_WAIT,
  target: 'turn',
};

export interface BehaviorActorOptions extends BaseOptions {
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOGGER]?: Logger;
  actor?: string;
}

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
@Inject(INJECT_EVENT, INJECT_LOGGER)
export class BehaviorActorService implements ActorService {
  protected actor: string;
  protected event: EventBus;
  protected logger: Logger;

  constructor(options: BehaviorActorOptions) {
    this.actor = mustExist(options.actor);
    this.event = mustExist(options[INJECT_EVENT]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
  }

  public async start() {
    this.event.on('state-room', (event) => {
      if (this.actor === event.actor.meta.id) {
        this.onRoom(event);
      }
    });
  }

  public async stop() {
    /* noop */
  }

  public async last(): Promise<Command> {
    return WAIT_CMD;
  }

  public onRoom(event: RoomEvent) {
    this.logger.debug({ event }, 'received room event from state');
  }
}

