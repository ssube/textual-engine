import { NotImplementedError } from '@apextoaster/js-utils';

import { TokenizerService } from '.';
import { Command } from '../../model/Command';

export class NaturalInput implements TokenizerService {
  public async split(input: string): Promise<Array<string>> {
    throw new NotImplementedError();
  }

  public async parse(input: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }
}
