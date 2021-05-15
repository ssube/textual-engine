import { InvalidArgumentError } from '@apextoaster/js-utils';
import { alt, createLanguage, regexp, string } from 'parsimmon';

import { InputChain } from './JoinChain';

export interface SplitOptions {
  group: {
    start: string;
    end: string;
  };
  split: string;
}

export function splitChain(input: string, options: SplitOptions): InputChain {
  const lang = createLanguage({
    List: (r) => string('(').then(r.Value.sepBy(string('|'))).skip(string(')')),
    Token: () => regexp(/[-a-zA-Z ]+/),
    Value: (r) => alt(r.List, r.Token),
  });

  const parse = lang.Value.tryParse(input);
  if (typeof parse === 'string') {
    return [parse];
  }

  if (Array.isArray(parse)) {
    return parse;
  }

  throw new InvalidArgumentError('parse did not return a string or array');
}
