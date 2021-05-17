import { NotImplementedError } from '@apextoaster/js-utils';

import { Command, Input } from '.';

const WAIT_CMD: Command = {
  input: 'wait turn',
  verb: 'wait',
  target: 'turn',
};

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
export class BehaviorInput implements Input {
  public tokenize(input: string): Promise<Array<string>> {
    throw new NotImplementedError();
  }

  public async parse(input: string): Promise<Command> {
    return WAIT_CMD;
  }

  public async last(): Promise<Command> {
    return WAIT_CMD;
  }
}
