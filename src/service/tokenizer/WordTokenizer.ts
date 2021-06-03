import { constructorName, getOrDefault, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { TokenizerService } from '.';
import { Command } from '../../model/Command';
import { INJECT_LOCALE, INJECT_LOGGER } from '../../module';
import { LocaleService } from '../locale';

const REMOVED_WORDS = new Set([
  'a',
  'an',
  'at',
  'on',
  'the',
  'to',
  'toward',
  'towards',
]);

const SPLIT_CHAR = ' ';

interface WordTokenizerOptions extends BaseOptions {
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_LOCALE, INJECT_LOGGER)
export class WordTokenizer implements TokenizerService {
  protected locale: LocaleService;
  protected logger: Logger;
  protected verbs: Map<string, string>;

  constructor(options: WordTokenizerOptions) {
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.verbs = new Map();
  }

  public async split(input: string): Promise<Array<string>> {
    return trim(input)
      .toLocaleLowerCase()
      .split(SPLIT_CHAR)
      .map(trim)
      .filter((it) => it.length > 0)
      .filter((it) => REMOVED_WORDS.has(it) === false);
  }

  public async parse(input: string): Promise<Array<Command>> {
    const [rawVerb, ...targets] = await this.split(input);
    const verb = getOrDefault(this.verbs, rawVerb, rawVerb); // get the translation or return the raw verb
    const cmd: Command = {
      index: 0,
      input,
      verb,
      target: '',
    };

    // 2+ segments and the last one is all digits
    const last = targets[targets.length - 1];
    if (targets.length > 1 && /^[0-9]+$/.test(last)) {
      targets.pop();
      cmd.index = parseInt(last, 10);
    }

    cmd.target = targets.join(SPLIT_CHAR);

    return [cmd];
  }

  public async translate(verbs: ReadonlyArray<string>): Promise<void> {
    this.verbs.clear();

    this.logger.debug({ verbs }, 'translating verbs');

    for (const verb of verbs) {
      const translated = this.locale.translate(verb);
      this.verbs.set(translated, verb); // trick i18next into translating them back
    }
  }
}

export function trim(str: string): string {
  return str
    .replace(/^\s+/, '')
    .replace(/\s+$/, '');
}
