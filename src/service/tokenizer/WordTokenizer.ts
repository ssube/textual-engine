import { getOrDefault, mustExist } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { TokenizerService } from '.';
import { Command } from '../../model/Command';
import { INJECT_LOCALE, INJECT_LOGGER, InjectedOptions } from '../../module';
import { groupOn } from '../../util/collection/array';
import { REMOVE_WORDS, SPLIT_CHAR, TARGET_WORDS } from '../../util/constants';
import { makeServiceLogger } from '../../util/service';
import { trim } from '../../util/string';
import { LocaleService } from '../locale';

@Inject(INJECT_LOCALE, INJECT_LOGGER)
export class WordTokenizer implements TokenizerService {
  protected locale: LocaleService;
  protected logger: Logger;
  protected verbs: Map<string, string>;

  constructor(options: InjectedOptions) {
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
    this.verbs = new Map();
  }

  public async split(input: string): Promise<Array<string>> {
    return trim(input)
      .toLocaleLowerCase()
      .split(SPLIT_CHAR)
      .map(trim)
      .filter((it) => it.length > 0)
      .filter((it) => REMOVE_WORDS.has(it) === false);
  }

  public async parse(input: string): Promise<Array<Command>> {
    const [rawVerb, ...targets] = await this.split(input);
    const verb = getOrDefault(this.verbs, rawVerb, rawVerb); // get the translation or return the raw verb
    const cmd: Command = {
      index: 0,
      input,
      verb,
      targets: [],
    };

    // 2+ segments and the last one is all digits
    const last = targets[targets.length - 1];
    if (targets.length > 1 && /^[0-9]+$/.test(last)) {
      targets.pop();
      cmd.index = parseInt(last, 10);
    }

    cmd.targets = groupOn(targets, TARGET_WORDS).map((it) => it.join(SPLIT_CHAR));

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
