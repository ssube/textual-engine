import parser from 'yargs-parser';

export interface ParsedArgs {
  config: string;
  data: Array<string>;
  module: Array<string>;
  seed: string;
  world: string;
}

export function parseArgs(args: Array<string>): ParsedArgs {
  const argv = parser(args, {
    alias: {
      data: ['d'],
    },
    array: ['data', 'module'],
    default: {
      module: ['local', 'input', 'node'],
    },
    // envPrefix: 'TEXTUAL_',
    string: ['config', 'seed', 'world'],
  });

  return (argv as unknown) as ParsedArgs;
}
