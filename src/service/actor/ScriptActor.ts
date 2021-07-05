import { mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';
import { Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { ConfigError } from '../../error/ConfigError';
import { Command } from '../../model/Command';
import { ActorSource, ReadonlyActor } from '../../model/entity/Actor';
import { ReadonlyRoom } from '../../model/entity/Room';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT, InjectedOptions } from '../../module';
import { catchAndLog } from '../../util/async/event';
import { EVENT_ACTOR_COMMAND, EVENT_STATE_ROOM, EVENT_STATE_STEP } from '../../util/constants';
import { zeroStep } from '../../util/entity';
import { findMatching } from '../../util/entity/find';
import { makeSchema } from '../../util/schema';
import { makeServiceLogger } from '../../util/service';
import { EventBus } from '../event';
import { RandomService } from '../random';
import { ScriptService } from '../script';
import { StepResult } from '../state';
import { StateRoomEvent, StateStepEvent } from '../state/events';

export interface ScriptActorConfig {
  attack: number;
  wander: number;
}

export const SCRIPT_ACTOR_SCHEMA: JSONSchemaType<ScriptActorConfig> = {
  type: 'object',
  properties: {
    attack: {
      type: 'number',
      default: 1.00,
    },
    wander: {
      type: 'number',
      default: 0.25,
    },
  },
  required: [],
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
    this.step = zeroStep();
  }

  public async start(): Promise<void> {
    this.event.on(EVENT_STATE_ROOM, (event) => {
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
    return this.script.invoke(event.actor, 'signal.behavior', {
      actor: event.actor,
      behavior: {
        depth: /* istanbul ignore next */ () => Promise.resolve(0), // TODO: implement
        queue: (actor, command) => this.queue(event.room, actor, command),
        ready: /* istanbul ignore next */ () => Promise.resolve(false), // TODO: implement
      },
      data: new Map([
        ['attack', this.config.attack],
        ['wander', this.config.wander],
      ]),
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

  protected async queue(room: ReadonlyRoom, actor: ReadonlyActor, command: Command): Promise<void> {
    this.event.emit(EVENT_ACTOR_COMMAND, {
      actor,
      command,
      room,
    });
  }
}
