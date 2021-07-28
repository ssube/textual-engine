/* eslint-disable @typescript-eslint/naming-convention */
import { alt, createLanguage, optWhitespace, regexp, string } from 'parsimmon';

import { InputChain } from './index.js';

/**
 * Unnecessarily customizable delimiters. Must be regex safe, may be multiple characters.
 */
export interface SplitOptions {
  group: {
    start: string;
    end: string;
  };
  split: string;
}

export function splitChain(input: string, options: SplitOptions): InputChain {
  const token = new RegExp(`[^${options.group.start}${options.group.end}${options.split}]+`);
  const lang = createLanguage<{
    Empty: string;
    List: InputChain;
    Token: string;
    Top: InputChain;
    Value: InputChain;
  }>({
    Empty: () => regexp(/^$/),
    List: (r) => string(options.group.start).then(r.Value.sepBy(string(options.split))).skip(string(options.group.end)),
    Token: () => regexp(token),
    Top: (r) => alt(r.Empty, r.Value.sepBy1(optWhitespace)),
    Value: (r) => alt(r.List, r.Token),
  });

  const parse = lang.Top.tryParse(input);

  if (Array.isArray(parse)) {
    return parse;
  } else {
    return [parse];
  }
}
