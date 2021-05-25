import parser from 'yargs-parser';

import { PORTAL_DEPTH } from './constants';

export interface ParsedArgs {
  config: string;
  data: Array<string>;
  depth: number;
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
      depth: PORTAL_DEPTH,
      module: ['local', 'input', 'node'],
    },
    // envPrefix: 'TEXTUAL_',
    number: ['depth'],
    string: ['config', 'seed', 'world'],
  });

  return (argv as unknown) as ParsedArgs;
}
