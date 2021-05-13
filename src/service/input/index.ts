export interface Command {
  verb: string;
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
  parse(input: string): Promise<Array<Command>>;
}
