import { Service } from '..';
import { Command } from '../../model/Command.js';
import { LocaleBundle } from '../../model/file/Locale.js';

export interface TokenizerService extends Service {
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

  translate(bundle: LocaleBundle): Promise<void>;
}
