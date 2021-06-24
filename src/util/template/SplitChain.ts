/* eslint-disable @typescript-eslint/naming-convention */
import { InvalidArgumentError } from '@apextoaster/js-utils';
import { alt, createLanguage, optWhitespace, regexp, string } from 'parsimmon';

import { InputChain } from '.';

export interface SplitOptions {
  group: {
    start: string;
    end: string;
  };
  split: string;
}

export function splitChain(input: string, options: SplitOptions): InputChain {
  const lang = createLanguage<{
    Empty: string;
    List: InputChain;
    Token: string;
    Top: InputChain;
    Value: InputChain;
  }>({
    Empty: () => regexp(/^$/),
    List: (r) => string(options.group.start).then(r.Value.sepBy(string(options.split))).skip(string(options.group.end)),
    Token: () => regexp(/[^,()|]+/),
    Top: (r) => alt(r.Empty, r.Value.sepBy1(optWhitespace)),
    Value: (r) => alt(r.List, r.Token),
  });

  const parse = lang.Top.tryParse(input);
  if (typeof parse === 'string') {
    return [parse];
  }

  if (Array.isArray(parse)) {
    return parse;
  }

  throw new InvalidArgumentError('parse did not return a string or array');
}
