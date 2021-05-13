import { Command, Input } from '.';

export class ClassicInput implements Input {
  protected history: Array<Command>;

  constructor() {
    this.history = [];
  }

  async tokenize(input: string): Promise<string[]> {
    return input.split(' ');
  }

  async parse(input: string): Promise<Command[]> {
    const tokens = await this.tokenize(input);
    const [verb, ...targets] = tokens;

    const cmd: Command = {
      input,
      verb,
      target: targets.join(' '),
    };

    this.history.push(cmd);

    return [cmd];
  }

  async last(): Promise<Command[]> {
    return this.history;
  }
}