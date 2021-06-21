import { defaultWhen, getOrDefault } from '@apextoaster/js-utils';
import nlp from 'compromise';

import { TokenizerService } from '.';
import { Command } from '../../model/Command';
import { InjectedOptions } from '../../module';
import { groupOn, remove } from '../../util/collection/array';
import { SPLIT_CHAR } from '../../util/constants';
import { SplitTokenizer } from './SplitTokenizer';

export class CompromiseTokenizer extends SplitTokenizer implements TokenizerService {
  protected nlp: typeof nlp;

  constructor(options: InjectedOptions) {
    super(options);

    this.nlp = nlp;
  }

  public async parse(input: string): Promise<Array<Command>> {
    const doc = this.nlp(input);

    const indexTerm = doc.terms()
      .filter((it: any) => it.has('#Cardinal'))
      .first();
    const verbTerm = doc.verbs()
      .toInfinitive() // TODO: only convert first
      .first();

    let targetDoc = doc.after(verbTerm);
    if (indexTerm.found) {
      targetDoc = targetDoc.before(indexTerm);
    }
    const targetTerms = targetDoc.split('#Preposition')
      .delete('#Conjunction')
      .delete('#Determiner')
      .delete('#Preposition')
      .toLowerCase();

    this.logger.debug({ indexTerm, targetTerms, verbTerm }, 'parsed parts of speech from document');

    const indexText = defaultWhen(indexTerm.found, indexTerm.text(), '0');
    const targetText = targetTerms.out('array');
    const verbText = verbTerm.toLowerCase().text();
    this.logger.debug({ indexText, targetText, verbText }, 'extracted index and verb text');

    const index = parseInt(indexText, 10);
    const targets = targetText;
    const verb = getOrDefault(this.verbs, verbText, verbText);
    const command: Command = {
      index,
      input,
      targets,
      verb,
    };

    const terms = doc.termList();
    this.logger.debug({ command, terms, targets }, 'built command from terms');

    return [command];
  }
}
