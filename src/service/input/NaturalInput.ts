import { NotImplementedError } from '@apextoaster/js-utils';

import { Command, Input } from '.';

export class NaturalInput implements Input {
  public last(): Promise<Array<Command>> {
    throw new NotImplementedError();
  }
  public tokenize(input: string): Promise<Array<string>> {
    throw new NotImplementedError();
  }
  public parse(input: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }
}
