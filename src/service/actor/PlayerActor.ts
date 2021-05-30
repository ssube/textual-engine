import { constructorName, doesExist, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { Actor } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { INJECT_COUNTER, INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, INJECT_TOKENIZER } from '../../module';
import { showCheck, ShowSource } from '../../util/actor';
import { catchAndLog } from '../../util/async/event';
import {
  COMMON_VERBS,
  EVENT_ACTOR_COMMAND,
  EVENT_ACTOR_JOIN,
  EVENT_ACTOR_OUTPUT,
  EVENT_COMMON_QUIT,
  EVENT_LOCALE_BUNDLE,
  EVENT_RENDER_OUTPUT,
  EVENT_STATE_JOIN,
  EVENT_STATE_LOAD,
  EVENT_STATE_OUTPUT,
  EVENT_STATE_ROOM,
} from '../../util/constants';
import { Counter } from '../counter';
import { EventBus, LineEvent } from '../event';
import { LocaleContext, LocaleService } from '../locale';
import { StateOutputEvent } from '../state/events';
import { TokenizerService } from '../tokenizer';

export interface PlayerActorOptions extends BaseOptions {
  [INJECT_COUNTER]?: Counter;
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_LOGGER]?: Logger;
  [INJECT_TOKENIZER]?: TokenizerService;
}

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
@Inject(INJECT_COUNTER, INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, INJECT_TOKENIZER)
export class PlayerActorService implements ActorService {
  protected counter: Counter;
  protected event: EventBus;
  protected locale: LocaleService;
  protected logger: Logger;
  protected tokenizer: TokenizerService;

  // old focus
  protected actor?: Actor;
  protected room?: Room;
  protected history: Array<Command>;

  /**
   * Unique player ID for message filtering.
   */
  protected pid: string;

  constructor(options: PlayerActorOptions) {
    this.counter = mustExist(options[INJECT_COUNTER]);
    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.tokenizer = mustExist(options[INJECT_TOKENIZER]);

    this.history = [];
    this.pid = `player-${this.counter.next('player')}`;
  }

  public async start() {
    this.event.on(EVENT_LOCALE_BUNDLE, (event) => {
      catchAndLog(this.tokenizer.translate(COMMON_VERBS), this.logger, 'error translating verbs');
    }, this);
    this.event.on(EVENT_RENDER_OUTPUT, (event) => {
      catchAndLog(this.onInput(event), this.logger, 'error during render output');
    }, this);
    this.event.on(EVENT_STATE_JOIN, (event) => {
      if (this.pid === event.pid) {
        this.actor = event.actor;
      }
    }, this);
    this.event.on(EVENT_STATE_LOAD, (event) => {
      this.event.emit(EVENT_ACTOR_JOIN, {
        pid: this.pid,
      });
    }, this);
    this.event.on(EVENT_STATE_ROOM, (event) => {
      if (event.room.actors.find((it) => it.meta.name === this.pid)) {
        this.room = event.room;
      }
    }, this);
    this.event.on(EVENT_STATE_OUTPUT, (event) => {
      catchAndLog(this.onOutput(event), this.logger, 'error during state output');
    }, this);
    this.event.on(EVENT_COMMON_QUIT, () => {
      catchAndLog(this.showLine('meta.quit'), this.logger, 'error sending quit output');
    }, this);
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
      await this.parseLine(line);
    }
  }

  public async onOutput(event: StateOutputEvent): Promise<void> {
    this.logger.debug({ event }, 'filtering output');

    if (doesExist(this.actor) && doesExist(this.room) && doesExist(event.source)) {
      const target: ShowSource = {
        actor: this.actor,
        room: this.room,
      };

      if (showCheck(event.source, target, event.volume) === false) {
        return;
      }
    }

    this.logger.debug({ event }, 'translating output');
    return this.showLine(event.line, event.context);
  }

  public async parseLine(line: string): Promise<void> {
    const commands = await this.tokenizer.parse(line);
    this.logger.debug({ line, commands }, 'parsed input line');

    this.history.push(...commands);
    for (const command of commands) {
      this.event.emit(EVENT_ACTOR_COMMAND, {
        actor: this.actor,
        command,
      });
    }
  }

  public async showLine(key: string, context?: LocaleContext): Promise<void> {
    const line = this.locale.translate(key, context);
    this.event.emit(EVENT_ACTOR_OUTPUT, {
      lines: [line],
    });
  }
}
