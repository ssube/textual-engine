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
   * Parsed targets.
   */
  targets: Array<string>;
}

export function makeCommand(verb: string, ...targets: Array<string>): Command {
  return makeCommandIndex(verb, 0, ...targets);
}

export function makeCommandIndex(verb: string, index = 0, ...targets: Array<string>): Command {
  const input = [verb, ...targets].join(' ');
  return {
    index,
    input,
    targets,
    verb,
  };
}
