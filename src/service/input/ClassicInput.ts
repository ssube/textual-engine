import { Command, Input } from '.';

const REMOVED_WORDS = new Set([
  'a',
  'an',
  'at',
  'the',
  'to',
  'toward',
  'towards',
]);

const SPLIT_CHAR = ' ';

export class ClassicInput implements Input {
  protected history: Array<Command>;

  constructor() {
    this.history = [];
  }

  async tokenize(input: string): Promise<string[]> {
    return input.split(SPLIT_CHAR);
  }

  async parse(input: string): Promise<Command[]> {
    const rawTokens = await this.tokenize(input);
    const tokens = rawTokens.map((it) => it.toLocaleLowerCase()).filter((it) => REMOVED_WORDS.has(it) === false);
    const [verb, ...targets] = tokens;

    const cmd: Command = {
      input,
      verb,
      target: targets.join(SPLIT_CHAR),
    };

    this.history.unshift(cmd);

    return [cmd];
  }

  async last(): Promise<Command[]> {
    return this.history;
  }
}