import parser from 'yargs-parser';

import { PORTAL_DEPTH } from '../constants';

export interface ParsedArgs {
  config: string;
  data: Array<string>;
  input: Array<string>;
  module: Array<string>;
}

export function parseArgs(args: Array<string>): ParsedArgs {
  const argv = parser(args, {
    alias: {
      config: ['c'],
      data: ['d'],
      input: ['i'],
      module: ['m'],
    },
    array: ['data', 'input', 'module'],
    default: {
      depth: PORTAL_DEPTH,
      module: ['node'],
    },
    // envPrefix: 'TEXTUAL_',
    string: ['config'],
  });

  return (argv as unknown) as ParsedArgs;
}
