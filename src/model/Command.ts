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

export enum CommandOrder {
  FIRST = 'first',
  NEXT = 'next',
  LAST = 'last',
}

export function makeCommand(verb: string, ...targets: Array<string>): Command {
  return makeCommandIndex(verb, 0, ...targets);
}

/**
 * Create a command with a specific index.
 *
 * The index would normally come last in the game input, but that is not allowed with a rest parameter.
 */
export function makeCommandIndex(verb: string, index: number, ...targets: Array<string>): Command {
  const input = [verb, ...targets].join(' ');
  return {
    index,
    input,
    targets,
    verb,
  };
}
