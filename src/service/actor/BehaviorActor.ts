import { NotImplementedError } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { BaseOptions } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { VERB_WAIT } from '../../util/constants';

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
export class BehaviorActorService extends EventEmitter implements ActorService {
  constructor(options: BaseOptions) {
    super();
  }

  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public async translate(verbs: Array<string>): Promise<void> {
    throw new NotImplementedError();
  }

  public async last(): Promise<Command> {
    return WAIT_CMD;
  }
}

