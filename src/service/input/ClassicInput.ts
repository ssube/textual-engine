import { Command, Input } from '.';

export class ClassicInput implements Input {
  constructor() {}

  async tokenize(input: string): Promise<string[]> {
    return input.split(' ');
  }

  async parse(input: string): Promise<Command[]> {
    const tokens = await this.tokenize(input);
    const [verb, ...targets] = tokens;

    return [{
      verb,
      target: targets.join(' '),
    }];
  }
}