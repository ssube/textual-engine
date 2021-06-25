import { getOrDefault, mustExist } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { TokenizerService } from '.';
import { Command } from '../../model/Command';
import { LocaleBundle } from '../../model/file/Locale';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, InjectedOptions } from '../../module';
import { catchAndLog } from '../../util/async/event';
import { groupOn } from '../../util/collection/array';
import { EVENT_LOCALE_BUNDLE, EVENT_RENDER_INPUT, EVENT_TOKEN_COMMAND, SPLIT_CHAR } from '../../util/constants';
import { makeServiceLogger } from '../../util/service';
import { trim } from '../../util/string';
import { EventBus } from '../event';
import { LocaleService } from '../locale';
import { RenderInputEvent } from '../render/events';

@Inject(INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER)
export class SplitTokenizer implements TokenizerService {
  protected event: EventBus;
  protected locale: LocaleService;
  protected logger: Logger;

  // word lists
  protected articles: Set<string>;
  protected prepositions: Set<string>;
  protected verbs: Map<string, string>;

  constructor(options: InjectedOptions) {
    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);

    this.articles = new Set();
    this.prepositions = new Set();
    this.verbs = new Map();
  }

  public async start(): Promise<void> {
    this.event.on(EVENT_LOCALE_BUNDLE, (event) => {
      catchAndLog(this.translate(event.bundle), this.logger, 'error translating verbs');
    }, this);

    this.event.on(EVENT_RENDER_INPUT, (event) => {
      catchAndLog(this.onRenderInput(event), this.logger, 'error during render output');
    }, this);
  }

  public async onRenderInput(event: RenderInputEvent): Promise<void> {
    this.logger.debug({ event }, 'parsing render input');

    const commands = await this.parse(event.line);
    this.logger.debug({ commands, event }, 'parsed input line');

    for (const command of commands) {
      this.event.emit(EVENT_TOKEN_COMMAND, {
        command,
      });
    }
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
  }

  public async split(input: string): Promise<Array<string>> {
    return trim(input)
      .toLocaleLowerCase()
      .split(SPLIT_CHAR)
      .map(trim)
      .filter((it) => it.length > 0)
      .filter((it) => this.articles.has(it) === false);
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

    cmd.targets = groupOn(targets, this.prepositions).map((it) => it.join(SPLIT_CHAR));

    return [cmd];
  }

  public async translate(bundle: LocaleBundle): Promise<void> {
    // TODO: old world words should be removed, not config words
    /*
    this.articles.clear();
    this.prepositions.clear();
    this.verbs.clear();
    */

    this.logger.debug({ bundle }, 'translating bundle');

    for (const article of bundle.words.articles) {
      this.articles.add(article);
    }

    for (const preposition of bundle.words.prepositions) {
      this.prepositions.add(preposition);
    }

    for (const verb of bundle.words.verbs) {
      const translated = this.locale.translate(verb);
      this.logger.debug({ translated, verb }, 'adding translated verb pair');
      this.verbs.set(translated, verb); // trick i18next into translating them back
    }
  }
}
