export interface Command {
  /**
   * If multiple entities match the target, the index to select.
   */
  index: number;

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
