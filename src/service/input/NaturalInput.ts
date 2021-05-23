import { NotImplementedError } from '@apextoaster/js-utils';

import { Command, Input } from '.';

export class NaturalInput implements Input {
  public async last(): Promise<Command> {
    throw new NotImplementedError();
  }
  public async tokenize(input: string): Promise<Array<string>> {
    throw new NotImplementedError();
  }
  public async parse(input: string): Promise<Command> {
    throw new NotImplementedError();
  }
  public async translate(verbs: Array<string>): Promise<void> {
    throw new NotImplementedError();
  }
}
