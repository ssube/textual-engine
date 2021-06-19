import { getOrDefault, mustCoalesce } from '@apextoaster/js-utils';
import nlp from 'compromise';

import { TokenizerService } from '.';
import { Command, makeCommand } from '../../model/Command';
import { InjectedOptions } from '../../module';
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
    const target = [...nouns, ...others].join(' ');
    const verb = getOrDefault(this.verbs, rawVerb, rawVerb);
    const command = makeCommand(verb, target, index);

    const terms = doc.termList();
    this.logger.debug({ command, terms }, 'built command from document');

    return [command];
  }
}
