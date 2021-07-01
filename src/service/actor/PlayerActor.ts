import { doesExist, mustExist } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { ReadonlyActor } from '../../model/entity/Actor';
import { ReadonlyRoom } from '../../model/entity/Room';
import { INJECT_COUNTER, INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, InjectedOptions } from '../../module';
import { checkVolume, StateSource } from '../../util/actor';
import { catchAndLog } from '../../util/async/event';
import {
  EVENT_ACTOR_COMMAND,
  EVENT_ACTOR_JOIN,
  EVENT_ACTOR_OUTPUT,
  EVENT_ACTOR_ROOM,
  EVENT_COMMON_QUIT,
  EVENT_STATE_JOIN,
  EVENT_STATE_LOAD,
  EVENT_STATE_OUTPUT,
  EVENT_STATE_ROOM,
  EVENT_TOKEN_COMMAND,
} from '../../util/constants';
import { makeServiceLogger } from '../../util/service';
import { Counter } from '../counter';
import { EventBus } from '../event';
import { LocaleContext, LocaleService } from '../locale';
import { StepResult } from '../state';
import { StateJoinEvent, StateOutputEvent, StateRoomEvent } from '../state/events';
import { TokenCommandEvent } from '../tokenizer/events';

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
@Inject(INJECT_COUNTER, INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER)
export class PlayerActorService implements ActorService {
  protected counter: Counter;
  protected event: EventBus;
  protected locale: LocaleService;
  protected logger: Logger;

  // old focus
  protected actor?: ReadonlyActor;
  protected room?: ReadonlyRoom;
  protected history: Array<Command>;

  /**
   * Unique player ID for message filtering.
   */
  protected pid: string;

  constructor(options: InjectedOptions) {
    this.counter = mustExist(options[INJECT_COUNTER]);
    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);

    this.history = [];
    this.pid = `player-${this.counter.next('player')}`;
  }

  public async start(): Promise<void> {
    this.event.on(EVENT_TOKEN_COMMAND, (event) => {
      catchAndLog(this.onRenderOutput(event), this.logger, 'error during render output');
    }, this);
    this.event.on(EVENT_STATE_JOIN, (event) => {
      this.onJoin(event);
    }, this);
    this.event.on(EVENT_STATE_LOAD, (_event) => {
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

      this.event.emit(EVENT_ACTOR_ROOM, {
        actor: this.actor,
        pid: this.pid,
        room: this.room,
      });
    } else {
      this.logger.debug({ event }, 'actor joined state');
    }
  }

  public onRoom(event: StateRoomEvent): void {
    const actor = event.room.actors.find((it) => it.meta.id === this.pid);
    if (doesExist(actor)) {
      this.logger.debug({ event }, 'updating own room');
      this.room = event.room;

      this.event.emit(EVENT_ACTOR_ROOM, {
        actor,
        pid: this.pid,
        room: event.room,
      });
    }
  }

  public async onRenderOutput(event: TokenCommandEvent): Promise<void> {
    this.logger.debug({ event }, 'sending input as actor command');

    this.history.push(event.command);
    this.event.emit(EVENT_ACTOR_COMMAND, {
      actor: this.actor,
      command: event.command,
      room: this.room,
    });
  }

  public async onStateOutput(event: StateOutputEvent): Promise<void> {
    this.logger.debug({ event }, 'filtering output');

    if (doesExist(this.room) && doesExist(event.source)) {
      const target: StateSource = {
        actor: this.actor,
        room: this.room,
      };

      if (checkVolume(event.source, target, event.volume) === false) {
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
