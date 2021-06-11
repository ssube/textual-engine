import { NotImplementedError } from '@apextoaster/js-utils';

import { TokenizerService } from '.';
import { Command } from '../../model/Command';

export class NaturalInput implements TokenizerService {
  public parse(_input: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }

  public split(_input: string): Promise<Array<string>> {
    throw new NotImplementedError();
  }

  public translate(_verbs: ReadonlyArray<string>): Promise<void> {
    throw new NotImplementedError();
  }
}
