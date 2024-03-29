import { mustExist } from '@apextoaster/js-utils';
import { JSONSchemaType } from 'ajv';
import { Inject, Logger } from 'noicejs';

import { RenderService } from '..';
import { ShortcutData, StatusItem } from '../../../component/shared.js';
import { ConfigError } from '../../../error/ConfigError.js';
import { TemplateMetadata } from '../../../model/mapped/Template.js';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, InjectedOptions } from '../../../module/index.js';
import { onceEvent } from '../../../util/async/event.js';
import { ClearResult, debounce } from '../../../util/async/Throttle.js';
import {
  EVENT_ACTOR_OUTPUT,
  EVENT_ACTOR_QUIT,
  EVENT_ACTOR_ROOM,
  EVENT_COMMON_QUIT,
  EVENT_RENDER_INPUT,
  EVENT_STATE_STEP,
  EVENT_STATE_WORLD,
} from '../../../util/constants.js';
import { zeroStep } from '../../../util/entity/index.js';
import { getEventShortcuts } from '../../../util/render/index.js';
import { makeSchema } from '../../../util/schema/index.js';
import { makeServiceLogger } from '../../../util/service/index.js';
import { ActorOutputEvent, ActorQuitEvent, ActorRoomEvent } from '../../actor/events.js';
import { EventBus } from '../../event/index.js';
import { LocaleService } from '../../locale/index.js';
import { StepResult } from '../../state/index.js';
import { StateStepEvent, StateWorldEvent } from '../../state/events.js';

export interface BaseRenderConfig {
  shortcuts: boolean;
  status: boolean;
  throttle: number;
}

export const BASE_RENDER_SCHEMA: JSONSchemaType<BaseRenderConfig> = {
  type: 'object',
  properties: {
    shortcuts: {
      type: 'boolean',
      default: true,
    },
    status: {
      type: 'boolean',
      default: true,
    },
    throttle: {
      type: 'number',
    },
  },
  required: ['throttle'],
};

@Inject(INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER)
export abstract class BaseReactRender implements RenderService {
  // services
  protected config: BaseRenderConfig;
  protected event: EventBus;
  protected logger: Logger;
  protected locale: LocaleService;

  // state
  protected input: string;
  protected output: Array<string>;
  protected prompt: string;
  protected quit: boolean;
  protected shortcuts: ShortcutData;
  protected step: StepResult;
  protected stats: Array<StatusItem>;
  protected worlds: Array<TemplateMetadata>;

  protected queueUpdate: ClearResult;

  public abstract update(): void;

  constructor(options: InjectedOptions) {
    const config = mustExist(options.config);
    const schema = makeSchema(BASE_RENDER_SCHEMA);
    if (!schema(config)) {
      throw new ConfigError('invalid service config');
    }

    this.config = config;
    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);

    this.queueUpdate = debounce(this.config.throttle, () => this.update());

    this.input = '';
    this.output = [];
    this.prompt = '';
    this.quit = false;
    this.shortcuts = {
      actors: [],
      items: [],
      portals: [],
      verbs: [],
    };
    this.stats = [];
    this.step = zeroStep();
    this.worlds = [];
  }

  public async start(): Promise<void> {
    this.setPrompt(`turn ${this.step.turn}`);
    this.update();

    this.event.on(EVENT_ACTOR_OUTPUT, (output) => this.onOutput(output), this);
    this.event.on(EVENT_ACTOR_ROOM, (room) => this.onRoom(room), this);
    this.event.on(EVENT_ACTOR_QUIT, (event) => this.onQuit(event), this);
    this.event.on(EVENT_STATE_STEP, (step) => this.onStep(step), this);
    this.event.on(EVENT_STATE_WORLD, (event) => this.onWorlds(event));
  }

  public async stop(): Promise<void> {
    this.queueUpdate.clear();
    this.event.removeGroup(this);
  }

  public setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  public async read(): Promise<string> {
    const event = await onceEvent<ActorOutputEvent>(this.event, EVENT_RENDER_INPUT);
    return event.line;
  }

  public async show(msg: string): Promise<void> {
    this.output.push(msg);
  }

  /**
   * Handler for output line events received from actor service.
   */
  public onOutput(event: ActorOutputEvent): void {
    this.logger.debug({ event }, 'handling output event from actor');
    this.output.push(event.line);
    this.queueUpdate.call();
  }

  /**
   * Handler for quit events received from state service.
   */
  public onQuit(event: ActorQuitEvent): void {
    this.logger.debug('handling quit event from state');
    this.quit = true;

    this.output.push(event.line);

    for (const { name, value } of event.stats) {
      this.output.push(`${name}: ${value}`);
    }

    this.update();

    this.event.emit(EVENT_COMMON_QUIT);
  }

  /**
   * Handler for step events received from state service.
   */
  public onRoom(result: ActorRoomEvent): void {
    this.logger.debug(result, 'handling room event from state');

    const { shortcuts, stats } = getEventShortcuts(result);
    this.shortcuts = shortcuts;
    this.stats = stats;

    this.setPrompt(`turn ${this.step.turn}`);
    this.queueUpdate.call();
  }

  public onStep(event: StateStepEvent): void {
    this.logger.debug({ event }, 'handling step event from state');

    this.step = event.step;
    this.setPrompt(`turn ${this.step.turn}`);
    this.update();
  }

  public onWorlds(event: StateWorldEvent): void {
    this.worlds = event.worlds;
  }

  /**
   * Handler for lines received from the React tree.
   */
  public nextLine(line: string): void {
    this.logger.debug({ line }, 'handling line event from React');

    // update inner state
    this.input = line;

    // append to buffer
    this.output.push(`${this.prompt} > ${this.input}`);

    if (line.length > 0) {
      // forward event to state
      this.event.emit(EVENT_RENDER_INPUT, {
        line,
      });
    }
  }
}
