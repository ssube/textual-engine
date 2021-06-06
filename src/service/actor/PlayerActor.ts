import { constructorName, doesExist, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { Actor } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { INJECT_COUNTER, INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, INJECT_TOKENIZER } from '../../module';
import { showCheck, StateSource } from '../../util/actor';
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
import { EventBus } from '../event';
import { LocaleContext, LocaleService } from '../locale';
import { RenderOutputEvent } from '../render/events';
import { StepResult } from '../state';
import { StateJoinEvent, StateOutputEvent, StateRoomEvent } from '../state/events';
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

  public async start(): Promise<void> {
    this.event.on(EVENT_LOCALE_BUNDLE, (event) => {
      catchAndLog(this.tokenizer.translate([
        ...COMMON_VERBS,
        ...event.bundle.verbs,
      ]), this.logger, 'error translating verbs');
    }, this);
    this.event.on(EVENT_RENDER_OUTPUT, (event) => {
      catchAndLog(this.onRenderOutput(event), this.logger, 'error during render output');
    }, this);
    this.event.on(EVENT_STATE_JOIN, (event) => {
      this.onJoin(event);
    }, this);
    this.event.on(EVENT_STATE_LOAD, (event) => {
      this.event.emit(EVENT_ACTOR_JOIN, {
        pid: this.pid,
      });
    }, this);
    this.event.on(EVENT_STATE_ROOM, (event) => {
      this.onRoom(event);
    }, this);
    this.event.on(EVENT_STATE_OUTPUT, (event) => {
      catchAndLog(this.onStateOutput(event), this.logger, 'error during state output');
    }, this);
    this.event.on(EVENT_COMMON_QUIT, () => {
      catchAndLog(this.showLine({ time: 0, turn: 0 }, 'meta.quit'), this.logger, 'error sending quit output');
    }, this);
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
  }

  public async last(): Promise<Command> {
    return this.history[this.history.length - 1];
  }

  public onJoin(event: StateJoinEvent): void {
    if (this.pid === event.pid) {
      this.logger.debug({ event }, 'registering own actor');
      this.actor = event.actor;
      this.room = event.room;
    } else {
      this.logger.debug({ event }, 'actor joined state');
    }
  }

  public onRoom(event: StateRoomEvent): void {
    if (event.room.actors.find((it) => it.meta.id === this.pid)) {
      this.logger.debug({ event }, 'updating own room');
      this.room = event.room;
    }
  }

  public async onRenderOutput(event: RenderOutputEvent): Promise<void> {
    this.logger.debug({ event }, 'tokenizing input');

    const commands = await this.tokenizer.parse(event.line);
    this.logger.debug({ commands, event }, 'parsed input line');

    this.history.push(...commands);
    for (const command of commands) {
      this.event.emit(EVENT_ACTOR_COMMAND, {
        actor: this.actor,
        command,
        room: this.room,
      });
    }
  }

  public async onStateOutput(event: StateOutputEvent): Promise<void> {
    this.logger.debug({ event }, 'filtering output');

    if (doesExist(this.actor) && doesExist(this.room) && doesExist(event.source)) {
      const target: StateSource = {
        actor: this.actor,
        room: this.room,
      };

      if (showCheck(event.source, target, event.volume) === false) {
        return;
      }
    }

    this.logger.debug({ event }, 'translating output');
    return this.showLine(event.step, event.line, event.context);
  }

  public async showLine(step: StepResult, key: string, context?: LocaleContext): Promise<void> {
    const line = this.locale.translate(key, context);
    this.event.emit(EVENT_ACTOR_OUTPUT, {
      line,
      step,
    });
  }
}
