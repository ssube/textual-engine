import { Command, Input } from '.';

export class ClassicInput implements Input {
  protected lastParse: Array<Command>;

  constructor() {
    this.lastParse = [];
  }

  async tokenize(input: string): Promise<string[]> {
    return input.split(' ');
  }

  async parse(input: string): Promise<Command[]> {
    const tokens = await this.tokenize(input);
    const [verb, ...targets] = tokens;

    this.lastParse = [{
      verb,
      target: targets.join(' '),
    }];

    return this.lastParse;
  }

  async last(): Promise<Command[]> {
    return this.lastParse;
  }
}