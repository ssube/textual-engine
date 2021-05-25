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
export class BehaviorActorService implements ActorService {
  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public async last(): Promise<Command> {
    return WAIT_CMD;
  }
}

