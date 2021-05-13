import { Command, Input } from '.';

const WAIT_CMDS = [{
  input: 'wait turn',
  verb: 'wait',
  target: 'turn',
}];

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
export class BehaviorInput implements Input {
  tokenize(input: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }

  async parse(input: string): Promise<Command[]> {
    return WAIT_CMDS;
  }

  async last(): Promise<Command[]> {
    return WAIT_CMDS;
  }
}
