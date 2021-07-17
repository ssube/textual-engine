import { defer, doesExist, mustExist } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';
import { Inject, Logger } from 'noicejs';

import { ConfigError } from '../../error/ConfigError';
import { INJECT_EVENT, INJECT_LOGGER, InjectedOptions } from '../../module';
import { catchAndLog, onceEvent } from '../../util/async/event';
import {
  EVENT_ACTOR_OUTPUT,
  EVENT_ACTOR_QUIT,
  EVENT_COMMON_QUIT,
  EVENT_RENDER_INPUT,
  EVENT_STATE_STEP,
} from '../../util/constants';
import { makeSchema } from '../../util/schema';
import { makeServiceLogger } from '../../util/service';
import { EventBus } from '../event';

export interface ScriptInput {
  line: string;

  // triggers
  step?: number;
  time?: number;
}

export interface ScriptRenderConfig {
  inputs: Array<ScriptInput>;
  loops: number;
}

export const SCRIPT_RENDER_SCHEMA: JSONSchemaType<ScriptRenderConfig> = {
  type: 'object',
  properties: {
    inputs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          delay: {
            nullable: true,
            type: 'number',
          },
          line: {
            type: 'string',
          },
          step: {
            nullable: true,
            type: 'number',
          },
          time: {
            nullable: true,
            type: 'number',
          }
        },
        required: [],
      },
    },
    loops: {
      type: 'number',
      default: 1,
    },
  },
  required: ['inputs'],
};

@Inject(INJECT_EVENT, INJECT_LOGGER)
export class ScriptRender {
  protected config: ScriptRenderConfig;
  protected events: EventBus;
  protected logger: Logger;

  protected index: number;
  protected loop: number;
  protected output: Array<string>;

  constructor(options: InjectedOptions) {
    const config = mustExist(options.config);
    const schema = makeSchema(SCRIPT_RENDER_SCHEMA);
    if (!schema(config)) {
      throw new ConfigError('invalid service config');
    }

    this.config = config;
    this.events = mustExist(options[INJECT_EVENT]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);

    this.index = 0;
    this.loop = 0;
    this.output = [];
  }

  public async start(): Promise<void> {
    this.events.on(EVENT_ACTOR_QUIT, () => {
      this.events.emit(EVENT_COMMON_QUIT);
    }, this);

    this.events.on(EVENT_ACTOR_OUTPUT, (event) => {
      this.output.push(event.line);
    }, this);

    // TODO: start input on player join?
    if (this.config.inputs.length > 0) {
      this.queueInput(this.config.inputs[0]);
    }
  }

  public async stop(): Promise<void> {
    this.events.removeGroup(this);
  }

  public queueInput(next: ScriptInput): void {
    this.logger.debug({ next }, 'queueing next input');

    if (doesExist(next.time) && next.time > 0) {
      return catchAndLog(defer(next.time).then(() => this.queueInput({
        ...next,
        time: 0,
      })), this.logger, 'error queueing time deferred input');
    }

    if (doesExist(next.step) && next.step > 0) {
      const nextStep = next.step - 1; // if guard is not carried over into lambda body
      return catchAndLog(onceEvent(this.events, EVENT_STATE_STEP).then(() => this.queueInput({
        ...next,
        step: nextStep,
      })), this.logger, 'error queueing step deferred input');
    }

    this.events.emit(EVENT_RENDER_INPUT, {
      line: next.line,
    });

    this.queueNext();
  }

  public queueNext(): void {
    this.index = this.index + 1;

    // end of the loop
    if (this.index >= this.config.inputs.length) {
      this.loop = this.loop + 1;

      // any loops left
      if (this.loop >= this.config.loops) {
        return;
      } else {
        this.index = 0;
      }
    }

    this.queueInput(this.config.inputs[this.index]);
  }

  public getOutput(): ReadonlyArray<string> {
    return this.output;
  }
}
