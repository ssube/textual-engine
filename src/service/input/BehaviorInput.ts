import { NotImplementedError } from '@apextoaster/js-utils';

import { Command, Input } from '.';
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
export class BehaviorInput implements Input {
  public async tokenize(input: string): Promise<Array<string>> {
    throw new NotImplementedError();
  }

  public async translate(verbs: Array<string>): Promise<void> {
    throw new NotImplementedError();
  }

  public async parse(input: string): Promise<Command> {
    return WAIT_CMD;
  }

  public async last(): Promise<Command> {
    return WAIT_CMD;
  }
}
