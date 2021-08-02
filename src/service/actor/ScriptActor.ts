import { doesExist, isNil, mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';
import { Inject, Logger } from 'noicejs';

import { ActorService } from './index.js';
import { ConfigError } from '../../error/ConfigError.js';
import { Command } from '../../model/Command.js';
import { ActorSource, ReadonlyActor } from '../../model/entity/Actor.js';
import { ReadonlyRoom } from '../../model/entity/Room.js';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT, InjectedOptions } from '../../module/index.js';
import { StateSource } from '../../util/actor/index.js';
import { catchAndLog } from '../../util/async/event.js';
import {
  EVENT_ACTOR_COMMAND,
  EVENT_STATE_OUTPUT,
  EVENT_STATE_ROOM,
  EVENT_STATE_STEP,
  SIGNAL_BEHAVIOR,
} from '../../util/constants.js';
import { zeroStep } from '../../util/entity/index.js';
import { findMatching } from '../../util/entity/find.js';
import { makeSchema } from '../../util/schema/index.js';
import { makeServiceLogger } from '../../util/service/index.js';
import { EventBus } from '../event/index.js';
import { RandomService } from '../random/index.js';
import { ScriptService } from '../script/index.js';
import { StepResult } from '../state/index.js';
import { StateOutputEvent, StateRoomEvent, StateStepEvent } from '../state/events.js';

export interface ScriptActorConfig {
  data: Map<string, number>;
}

export const SCRIPT_ACTOR_SCHEMA: JSONSchemaType<ScriptActorConfig> = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      map: {
        keys: {
          type: 'string',
        },
        values: {
          type: 'number',
        },
      },
      required: [],
    },
  },
  required: ['data'],
};

/**
 * Script input generates commands by invoking the `signal.behavior` script.
 */
@Inject(INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT)
export class ScriptActorService implements ActorService {
  protected config: ScriptActorConfig;
  protected event: EventBus;
  protected logger: Logger;
  protected random: RandomService;
  protected script: ScriptService;

  protected output: Array<StateOutputEvent>;
  protected step: StepResult;

  constructor(options: InjectedOptions) {
    const config = mustExist(options.config);
    const schema = makeSchema(SCRIPT_ACTOR_SCHEMA);
    if (!schema(config)) {
      throw new ConfigError('invalid service config');
    }

    this.config = config;
    this.event = mustExist(options[INJECT_EVENT]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
    this.random = mustExist(options[INJECT_RANDOM]);
    this.script = mustExist(options[INJECT_SCRIPT]);

    this.output = [];
    this.step = zeroStep();
  }

  public async start(): Promise<void> {
    this.event.on(EVENT_STATE_OUTPUT, (event) => {
      this.logger.debug({ event }, 'actor output');
      this.output.push(event);
    }, this);

    this.event.on(EVENT_STATE_ROOM, (event) => {
      this.logger.debug({ event }, 'script actor state room');
      if (event.actor.source === ActorSource.BEHAVIOR) {
        catchAndLog(this.onRoom(event), this.logger, 'error during room event');
      }
    }, this);

    this.event.on(EVENT_STATE_STEP, (event) => {
      catchAndLog(this.onStep(event), this.logger, 'error during step event');
    }, this);
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
  }

  public async last(): Promise<Command> {
    throw new NotImplementedError();
  }

  public async onRoom(event: StateRoomEvent): Promise<void> {
    return this.script.invoke(event.actor, SIGNAL_BEHAVIOR, {
      actor: event.actor,
      behavior: {
        depth: (actor) => this.getDepth(actor),
        output: (target) => this.getOutput(target),
        queue: (actor, command) => this.queue(event.room, actor, command),
        ready: (actor) => this.getReady(actor),
      },
      data: new Map(this.config.data),
      random: this.random,
      room: event.room,
      state: {
        create: /* istanbul ignore next */ () => { throw new NotImplementedError('behavior scripts cannot create entities'); },
        enter: /* istanbul ignore next */ () => { throw new NotImplementedError('behavior scripts cannot enter rooms'); },
        find: (search) => Promise.resolve(findMatching([event.room], search)),
        move: /* istanbul ignore next */ () => { throw new NotImplementedError('behavior scripts cannot move entities'); },
        show: /* istanbul ignore next */ () => { throw new NotImplementedError('behavior scripts cannot show messages'); },
        quit: /* istanbul ignore next */ () => { throw new NotImplementedError('behavior scripts cannot quit the game'); },
        update: /* istanbul ignore next */ () => { throw new NotImplementedError('behavior scripts cannot update entities'); },
      },
      source: event,
      step: this.step,
    });
  }

  public async onStep(event: StateStepEvent): Promise<void> {
    this.step.time = event.step.time;
    this.step.turn = event.step.turn;
  }

  /**
   * @todo implement
   */
  public async getDepth(_actor: ReadonlyActor): Promise<number> {
    return 0;
  }

  /**
   * @todo return line with step
   */
  public async getOutput(target: StateSource): Promise<Array<string>> {
    return this.output.filter((event) => {
      if (isNil(event.source)) {
        return false;
      }

      if (event.source.room !== target.room) {
        return false;
      }

      if (doesExist(event.source.actor) && doesExist(target.actor) && event.source.actor !== target.actor) {
        return false;
      }

      return true;
    }).map((event) => event.line);
  }

  /**
   * @todo implement
   */
  public async getReady(_actor: ReadonlyActor): Promise<boolean> {
    return false;
  }

  protected async queue(room: ReadonlyRoom, actor: ReadonlyActor, command: Command): Promise<void> {
    this.event.emit(EVENT_ACTOR_COMMAND, {
      actor,
      command,
      room,
    });
  }
}
