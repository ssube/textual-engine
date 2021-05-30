import { constructorName, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, INJECT_TOKENIZER } from '../../module';
import { COMMON_VERBS, EVENT_ACTOR_COMMAND, EVENT_ACTOR_OUTPUT, EVENT_COMMON_QUIT, EVENT_RENDER_OUTPUT, EVENT_STATE_OUTPUT } from '../../util/constants';
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
  protected started: boolean;
  protected tokenizer: TokenizerService;

  protected history: Array<Command>;

  constructor(options: PlayerActorOptions) {
    this.history = [];

    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.started = false;
    this.tokenizer = mustExist(options[INJECT_TOKENIZER]);
  }

  public async start() {
    if (this.started) {
      return;
    }

    this.event.on(EVENT_RENDER_OUTPUT, (event) => {
      this.onInput(event).catch((err) => {
        this.logger.error(err, 'error during render output');
      });
    }, this);
    this.event.on(EVENT_STATE_OUTPUT, (event) => {
      this.onOutput(event).catch((err) => {
        this.logger.error(err, 'error during state output');
      });
    }, this);
    this.event.on(EVENT_COMMON_QUIT, () => {
      this.onInputLine('meta.quit').catch((err) => {
        this.logger.error(err, 'error sending quit output');
      });
    }, this);

    await this.tokenizer.translate(COMMON_VERBS);

    this.started = true;
  }

  public async stop() {
    this.event.removeGroup(this);
  }

  public async last(): Promise<Command> {
    return this.history[this.history.length - 1];
  }

  public async onInput(event: LineEvent): Promise<void> {
    this.logger.debug({ event }, 'tokenizing input');

    for (const line of event.lines) {
      await this.onInputLine(line);
    }
  }

  public async onInputLine(line: string): Promise<void> {
    const commands = await this.tokenizer.parse(line);
    this.logger.debug({ line, commands }, 'parsed input line');

    this.history.push(...commands);
    for (const command of commands) {
      this.event.emit(EVENT_ACTOR_COMMAND, {
        command,
      });
    }
  }

  public async onOutput(event: OutputEvent): Promise<void> {
    this.logger.debug({ event }, 'translating output');

    const lines = event.lines.map((it) => this.locale.translate(it.key, it.context));
    this.event.emit(EVENT_ACTOR_OUTPUT, {
      lines,
    });
  }
}
