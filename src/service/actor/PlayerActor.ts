import { constructorName, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, INJECT_TOKENIZER } from '../../module';
import { COMMON_VERBS } from '../../util/constants';
import { EventBus, LineEvent, OutputEvent } from '../event';
import { LocaleService } from '../locale';
import { TokenizerService } from '../tokenizer';

export interface PlayerActorOptions extends BaseOptions {
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_LOGGER]?: Logger;
  [INJECT_TOKENIZER]?: TokenizerService;
}

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
@Inject(INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, INJECT_TOKENIZER)
export class PlayerActorService implements ActorService {
  protected event: EventBus;
  protected locale: LocaleService;
  protected logger: Logger;
  protected tokenizer: TokenizerService;

  protected history: Array<Command>;

  constructor(options: PlayerActorOptions) {
    this.history = [];

    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.tokenizer = mustExist(options[INJECT_TOKENIZER]);
  }

  public async start() {
    this.event.on('render-output', (event) => this.onInput(event));
    this.event.on('state-output', (event) => this.onOutput(event));

    await this.tokenizer.translate(COMMON_VERBS);
  }

  public async stop() {
    /* noop */
  }

  public async last(): Promise<Command> {
    return this.history[this.history.length - 1];
  }

  public async onInput(event: LineEvent): Promise<void> {
    this.logger.debug({ event }, 'tokenizing input');

    for (const line of event.lines) {
      const commands = await this.tokenizer.parse(line);
      this.history.push(...commands);

      this.logger.debug({ event, commands }, 'translated event');

      for (const command of commands) {
        this.event.emit('actor-command', {
          command,
        });
      }
    }
  }

  public async onOutput(event: OutputEvent): Promise<void> {
    this.logger.debug({ event }, 'translating output');

    const lines = event.lines.map((it) => this.locale.translate(it.key, it.context));
    this.event.emit('actor-output', {
      lines,
    });
  }
}
