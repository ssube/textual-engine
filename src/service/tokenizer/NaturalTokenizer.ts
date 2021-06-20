import { getOrDefault, mustCoalesce } from '@apextoaster/js-utils';
import nlp from 'compromise';

import { TokenizerService } from '.';
import { Command } from '../../model/Command';
import { InjectedOptions } from '../../module';
import { groupOn } from '../../util/collection/array';
import { TARGET_WORDS } from '../../util/constants';
import { WordTokenizer } from './WordTokenizer';

export class NaturalTokenizer extends WordTokenizer implements TokenizerService {
  protected nlp: typeof nlp;

  constructor(options: InjectedOptions) {
    super(options);

    this.nlp = nlp;
  }

  public async parse(input: string): Promise<Array<Command>> {
    const doc = this.nlp(input);
    const nouns = doc.nouns().out('array');
    const numbers = doc.termList().filter((it) => it.tags.Cardinal).map((it) => it.text);
    const [rawIndex] = numbers;

    const verbs = doc.verbs();
    const others = verbs.trim().slice(1).out('array');
    const rawVerb = verbs.toInfinitive().first().toLowerCase().text();
    this.logger.debug({ nouns, others, rawIndex, rawVerb }, 'parsed parts of speech from document');

    const index = parseInt(mustCoalesce(rawIndex, '0'), 10);
    const targets = groupOn([
      ...nouns,
      ...others,
    ], TARGET_WORDS).map((it) => it.join(' '));
    const verb = getOrDefault(this.verbs, rawVerb, rawVerb);
    const command: Command = {
      index,
      input,
      targets,
      verb,
    };

    const terms = doc.termList();
    this.logger.debug({ command, terms }, 'built command from document');

    return [command];
  }
}
