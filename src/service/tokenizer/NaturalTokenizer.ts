import { NotImplementedError } from '@apextoaster/js-utils';

import { TokenizerService } from '.';
import { Command } from '../../model/Command';

export class NaturalTokenizer implements TokenizerService {
  public async parse(_input: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }

  public async split(_input: string): Promise<Array<string>> {
    throw new NotImplementedError();
  }

  public async translate(_verbs: ReadonlyArray<string>): Promise<void> {
    throw new NotImplementedError();
  }
}
