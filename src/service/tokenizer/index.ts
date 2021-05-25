import { Command } from '../../model/Command';

export interface TokenizerService {
  /**
   * Split an input string into a series of tokens, without
   * fully parsing their intent.
   */
  split(input: string): Promise<Array<string>>;

  /**
   * Parse an input string into a series of commands, looking
   * for keywords and respecting parts of speech.
   */
  parse(input: string): Promise<Array<Command>>;

  translate(verbs: ReadonlyArray<string>): Promise<void>;
}
