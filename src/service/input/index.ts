export interface Command {
  /**
   * Original input line.
   */
  input: string;

  /**
   * Parsed verb.
   */
  verb: string;

  /**
   * Parsed target.
   */
  target: string;
}

export interface Input {
  /**
   * Split an input string into a series of tokens, without
   * fully parsing their intent.
   */
  tokenize(input: string): Promise<Array<string>>;

  /**
   * Parse an input string into a series of commands, looking
   * for keywords and respecting parts of speech.
   */
  parse(input: string): Promise<Command>;

  /**
   * Return the last set of parsed commands again.
   */
  last(): Promise<Command>;
}
