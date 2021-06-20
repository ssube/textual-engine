import { defaultWhen, getOrDefault, mustCoalesce } from '@apextoaster/js-utils';
import nlp from 'compromise';

import { TokenizerService } from '.';
import { Command } from '../../model/Command';
import { InjectedOptions } from '../../module';
import { groupOn, remove } from '../../util/collection/array';
import { REMOVE_WORDS, TARGET_WORDS } from '../../util/constants';
import { WordTokenizer } from './WordTokenizer';

export class NaturalTokenizer extends WordTokenizer implements TokenizerService {
  protected nlp: typeof nlp;

  constructor(options: InjectedOptions) {
    super(options);

    this.nlp = nlp;
  }

  public async parse(input: string): Promise<Array<Command>> {
    const doc = this.nlp(input);

    const indexTerm = doc.terms().filter((it: any) => it.has('#Cardinal')).first();
    const verbTerm = doc.verbs().toInfinitive().first(); // TODO: only convert first

    let targetDoc = doc.after(verbTerm);
    if (indexTerm.found) {
      targetDoc = targetDoc.before(indexTerm);
    }
    const targetTerms = targetDoc.terms();

    this.logger.debug({ indexTerm, targetTerms, verbTerm }, 'parsed parts of speech from document');

    const indexText = defaultWhen(indexTerm.found, indexTerm.text(), '0');
    const targetText = remove(targetTerms.toLowerCase().out('array'), (it) => REMOVE_WORDS.has(it));
    const verbText = verbTerm.toLowerCase().text();
    this.logger.debug({ indexText, targetText, verbText }, 'extracted index and verb text');

    const index = parseInt(indexText, 10);
    const targets = groupOn(targetText, TARGET_WORDS).map((it) => it.join(' '));
    const verb = getOrDefault(this.verbs, verbText, verbText);
    const command: Command = {
      index,
      input,
      targets,
      verb,
    };

    const terms = doc.termList();
    this.logger.debug({ command, terms }, 'built command from terms');

    return [command];
  }
}
